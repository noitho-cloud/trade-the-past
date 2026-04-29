import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument, EtoroAuthError } from "@/lib/etoro-proxy";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "etoro");
  if (rateLimit.blocked) return rateLimit.response;
  const keys = await getEtoroKeys();
  if (!keys) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Not connected to eToro" }, { status: 401 }),
      rateLimit
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
      rateLimit
    );
  }

  const { symbol } = body as { symbol?: string };
  if (!symbol || typeof symbol !== "string") {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Symbol is required" }, { status: 400 }),
      rateLimit
    );
  }

  try {
    const result = await searchInstrument(keys, symbol.trim().toUpperCase());
    if (!result) {
      return addRateLimitHeaders(
        NextResponse.json({ error: "Instrument not found" }, { status: 404 }),
        rateLimit
      );
    }
    return addRateLimitHeaders(NextResponse.json(result), rateLimit);
  } catch (error) {
    if (error instanceof EtoroAuthError) {
      return addRateLimitHeaders(
        NextResponse.json({ error: error.message }, { status: 401 }),
        rateLimit
      );
    }
    const { logger } = await import("@/lib/logger");
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logger.error("eToro search failed", { route: "/api/etoro/search", symbol, timeout: isTimeout });
    return addRateLimitHeaders(
      NextResponse.json(
        { error: isTimeout ? "eToro API timed out — please try again" : "Failed to search instruments" },
        { status: isTimeout ? 504 : 502 }
      ),
      rateLimit
    );
  }
}

import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument } from "@/lib/etoro-proxy";
import { applyRateLimit } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "etoro");
  if (rateLimit.blocked) return rateLimit.response;
  const keys = await getEtoroKeys();
  if (!keys) {
    return NextResponse.json(
      { error: "Not connected to eToro" },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { symbol } = body as { symbol?: string };
  if (!symbol || typeof symbol !== "string") {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  try {
    const result = await searchInstrument(keys, symbol.trim().toUpperCase());
    if (!result) {
      return NextResponse.json(
        { error: `Instrument not found: ${symbol}` },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    const { logger } = await import("@/lib/logger");
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logger.error("eToro search failed", { route: "/api/etoro/search", symbol, timeout: isTimeout });
    return NextResponse.json(
      { error: isTimeout ? "eToro API timed out — please try again" : "Failed to search instruments" },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

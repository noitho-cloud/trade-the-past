import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument, buildEtoroHeaders, ETORO_API_BASE, EtoroAuthError } from "@/lib/etoro-proxy";
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
    const instrument = await searchInstrument(keys, symbol.trim().toUpperCase());
    if (!instrument) {
      return addRateLimitHeaders(
        NextResponse.json({ error: "Instrument not found" }, { status: 404 }),
        rateLimit
      );
    }

    const headers = buildEtoroHeaders(keys);
    const res = await fetch(
      `${ETORO_API_BASE}/watchlists/default-watchlist/selected-items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify([
          {
            ItemId: instrument.instrumentId,
            ItemType: "Instrument",
          },
        ]),
        signal: AbortSignal.timeout(10_000),
      }
    );

    if (res.status === 401 || res.status === 403) {
      return addRateLimitHeaders(
        NextResponse.json({ error: "eToro API keys are invalid — please reconnect" }, { status: 401 }),
        rateLimit
      );
    }
    if (!res.ok) {
      return addRateLimitHeaders(
        NextResponse.json({ error: "Failed to add to watchlist" }, { status: 502 }),
        rateLimit
      );
    }

    return addRateLimitHeaders(
      NextResponse.json({
        success: true,
        instrument: instrument.displayname,
        instrumentId: instrument.instrumentId,
      }),
      rateLimit
    );
  } catch (error) {
    if (error instanceof EtoroAuthError) {
      return addRateLimitHeaders(
        NextResponse.json({ error: error.message }, { status: 401 }),
        rateLimit
      );
    }
    const { logger } = await import("@/lib/logger");
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logger.error("Watchlist add failed", { route: "/api/etoro/watchlist", symbol, timeout: isTimeout });
    return addRateLimitHeaders(
      NextResponse.json(
        { error: isTimeout ? "eToro API timed out — please try again" : "Failed to add to watchlist" },
        { status: isTimeout ? 504 : 502 }
      ),
      rateLimit
    );
  }
}

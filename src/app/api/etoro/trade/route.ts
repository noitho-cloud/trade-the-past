import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument, executeTrade } from "@/lib/etoro-proxy";
import { logger } from "@/lib/logger";
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

  const { symbol, isBuy, amount, isDemo } = body as {
    symbol?: string;
    isBuy?: boolean;
    amount?: number;
    isDemo?: boolean;
  };

  if (!symbol || typeof symbol !== "string") {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Symbol is required" }, { status: 400 }),
      rateLimit
    );
  }

  if (typeof isBuy !== "boolean") {
    return addRateLimitHeaders(
      NextResponse.json({ error: "isBuy must be a boolean" }, { status: 400 }),
      rateLimit
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 }),
      rateLimit
    );
  }

  try {
    const instrument = await searchInstrument(keys, symbol.trim().toUpperCase());
    if (!instrument) {
      return addRateLimitHeaders(
        NextResponse.json({ error: `Instrument not found: ${symbol}` }, { status: 404 }),
        rateLimit
      );
    }

    const result = await executeTrade(keys, {
      instrumentId: instrument.instrumentId,
      isBuy,
      amount,
      isDemo: isDemo !== false,
    });

    if (!result.success) {
      return addRateLimitHeaders(
        NextResponse.json({ error: result.error ?? "Trade execution failed" }, { status: 502 }),
        rateLimit
      );
    }

    return addRateLimitHeaders(
      NextResponse.json({
        success: true,
        orderId: result.orderId,
        instrument: instrument.displayname,
        amount,
        direction: isBuy ? "buy" : "sell",
        mode: isDemo !== false ? "demo" : "real",
      }),
      rateLimit
    );
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logger.error("Trade execution failed", { route: "/api/etoro/trade", symbol, timeout: isTimeout });
    return addRateLimitHeaders(
      NextResponse.json(
        { error: isTimeout ? "eToro API timed out — please try again" : "Failed to execute trade" },
        { status: isTimeout ? 504 : 502 }
      ),
      rateLimit
    );
  }
}

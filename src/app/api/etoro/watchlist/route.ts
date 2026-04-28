import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument, buildEtoroHeaders, ETORO_API_BASE } from "@/lib/etoro-proxy";

export async function POST(request: Request) {
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
    const instrument = await searchInstrument(keys, symbol.trim().toUpperCase());
    if (!instrument) {
      return NextResponse.json(
        { error: `Instrument not found: ${symbol}` },
        { status: 404 }
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
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to add to watchlist" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      instrument: instrument.displayname,
      instrumentId: instrument.instrumentId,
    });
  } catch (error) {
    const { logger } = await import("@/lib/logger");
    logger.error("Watchlist add failed", { route: "/api/etoro/watchlist", symbol });
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 502 }
    );
  }
}

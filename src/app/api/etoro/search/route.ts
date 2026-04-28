import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument } from "@/lib/etoro-proxy";

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
    logger.error("eToro search failed", { route: "/api/etoro/search", symbol });
    return NextResponse.json(
      { error: "Failed to search instruments" },
      { status: 502 }
    );
  }
}

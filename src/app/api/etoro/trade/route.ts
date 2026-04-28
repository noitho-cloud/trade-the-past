import { NextResponse } from "next/server";
import { getEtoroKeys, searchInstrument, executeTrade } from "@/lib/etoro-proxy";

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

  const { symbol, isBuy, amount, isDemo } = body as {
    symbol?: string;
    isBuy?: boolean;
    amount?: number;
    isDemo?: boolean;
  };

  if (!symbol || typeof symbol !== "string") {
    return NextResponse.json(
      { error: "Symbol is required" },
      { status: 400 }
    );
  }

  if (typeof isBuy !== "boolean") {
    return NextResponse.json(
      { error: "isBuy must be a boolean" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "Amount must be a positive number" },
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

    const result = await executeTrade(keys, {
      instrumentId: instrument.instrumentId,
      isBuy,
      amount,
      isDemo: isDemo !== false,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Trade execution failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      instrument: instrument.displayname,
      amount,
      direction: isBuy ? "buy" : "sell",
      mode: isDemo !== false ? "demo" : "real",
    });
  } catch (error) {
    console.error("Trade error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 502 }
    );
  }
}

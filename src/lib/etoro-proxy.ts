import { cookies } from "next/headers";
import { decryptKeys, KEYS_COOKIE_NAME, type EtoroKeys } from "./auth";

const ETORO_API_BASE = "https://public-api.etoro.com/api/v1";

export async function getEtoroKeys(): Promise<EtoroKeys | null> {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(KEYS_COOKIE_NAME)?.value;
  if (!encrypted) return null;
  try {
    return decryptKeys(encrypted);
  } catch {
    return null;
  }
}

export function buildEtoroHeaders(keys: EtoroKeys): Record<string, string> {
  return {
    "x-request-id": crypto.randomUUID(),
    "x-api-key": keys.apiKey,
    "x-user-key": keys.userKey,
    "Content-Type": "application/json",
  };
}

export interface EtoroSearchResult {
  instrumentId: number;
  displayname: string;
  internalSymbolFull: string;
}

const ETORO_FETCH_TIMEOUT_MS = 10_000;

export async function searchInstrument(
  keys: EtoroKeys,
  symbol: string
): Promise<EtoroSearchResult | null> {
  const headers = buildEtoroHeaders(keys);
  const params = new URLSearchParams({
    internalSymbolFull: symbol,
    fields: "instrumentId,internalSymbolFull,displayname",
    pageSize: "1",
  });

  const res = await fetch(`${ETORO_API_BASE}/market-data/search?${params}`, {
    headers,
    signal: AbortSignal.timeout(ETORO_FETCH_TIMEOUT_MS),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const items = data?.Items ?? data?.items ?? [];
  if (items.length === 0) return null;

  const item = items[0];
  return {
    instrumentId: item.instrumentId ?? item.InstrumentID ?? item.instrumentID,
    displayname: item.displayname ?? item.DisplayName ?? symbol,
    internalSymbolFull: item.internalSymbolFull ?? symbol,
  };
}

export interface TradeRequest {
  instrumentId: number;
  isBuy: boolean;
  amount: number;
  leverage?: number;
  isDemo?: boolean;
}

export interface TradeResponse {
  success: boolean;
  orderId?: number;
  error?: string;
}

export async function executeTrade(
  keys: EtoroKeys,
  trade: TradeRequest
): Promise<TradeResponse> {
  const headers = buildEtoroHeaders(keys);
  const isDemo = trade.isDemo !== false;
  const endpoint = isDemo
    ? `${ETORO_API_BASE}/trading/execution/demo/market-open-orders/by-amount`
    : `${ETORO_API_BASE}/trading/execution/market-open-orders/by-amount`;

  const body = {
    InstrumentID: trade.instrumentId,
    IsBuy: trade.isBuy,
    Leverage: trade.leverage ?? 1,
    Amount: trade.amount,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(ETORO_FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    return { success: false, error: `Trade failed (${res.status})` };
  }

  const data = await res.json().catch(() => ({}));
  return {
    success: true,
    orderId: data.orderId ?? data.OrderId ?? data.OrderID,
  };
}

export { ETORO_API_BASE };

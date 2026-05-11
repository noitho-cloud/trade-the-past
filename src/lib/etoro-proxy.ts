import { cookies } from "next/headers";
import { decryptKeys, KEYS_COOKIE_NAME, type EtoroKeys } from "./auth";
import { SSO_SESSION_COOKIE, SSO_COOKIE_MAX_AGE, getValidAccessToken } from "./sso";

const ETORO_API_BASE = "https://public-api.etoro.com/api/v1";

export type ResolvedEtoroAuth =
  | { mode: "oauth"; accessToken: string }
  | { mode: "apikey"; keys: EtoroKeys };

export async function resolveEtoroAuth(): Promise<ResolvedEtoroAuth | null> {
  const cookieStore = await cookies();
  const sealed = cookieStore.get(SSO_SESSION_COOKIE)?.value;
  if (sealed) {
    const result = await getValidAccessToken(sealed);
    if (result) {
      if (result.updatedCookie) {
        cookieStore.set(SSO_SESSION_COOKIE, result.updatedCookie, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: SSO_COOKIE_MAX_AGE,
          path: "/",
        });
      }
      return { mode: "oauth", accessToken: result.token };
    }
    // Token refresh failed — clear the stale SSO cookie so session
    // endpoint stops reporting "connected" for a dead session.
    cookieStore.set(SSO_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }

  const encrypted = cookieStore.get(KEYS_COOKIE_NAME)?.value;
  if (!encrypted) return null;
  try {
    return { mode: "apikey", keys: decryptKeys(encrypted) };
  } catch {
    return null;
  }
}

/** @deprecated Prefer resolveEtoroAuth — returns keys only when API-key auth is in use */
export async function getEtoroKeys(): Promise<EtoroKeys | null> {
  const auth = await resolveEtoroAuth();
  return auth?.mode === "apikey" ? auth.keys : null;
}

export async function getEtoroRequestHeaders(): Promise<Record<string, string> | null> {
  const auth = await resolveEtoroAuth();
  if (!auth) return null;
  return auth.mode === "oauth" ? buildOAuthHeaders(auth.accessToken) : buildEtoroHeaders(auth.keys);
}

export function buildEtoroHeaders(keys: EtoroKeys): Record<string, string> {
  return {
    "x-request-id": crypto.randomUUID(),
    "x-api-key": keys.apiKey,
    "x-user-key": keys.userKey,
    "Content-Type": "application/json",
  };
}

export function buildOAuthHeaders(accessToken: string): Record<string, string> {
  return {
    "x-request-id": crypto.randomUUID(),
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function isEtoroKeys(x: EtoroKeys | Record<string, string>): x is EtoroKeys {
  return typeof (x as EtoroKeys).apiKey === "string" && typeof (x as EtoroKeys).userKey === "string";
}

export interface EtoroSearchResult {
  instrumentId: number;
  displayname: string;
  internalSymbolFull: string;
}

const ETORO_FETCH_TIMEOUT_MS = 10_000;

export class EtoroAuthError extends Error {
  constructor() {
    super("eToro API keys are invalid — please reconnect");
    this.name = "EtoroAuthError";
  }
}

export async function searchInstrument(
  keysOrHeaders: EtoroKeys | Record<string, string>,
  symbol: string
): Promise<EtoroSearchResult | null> {
  const headers = isEtoroKeys(keysOrHeaders) ? buildEtoroHeaders(keysOrHeaders) : keysOrHeaders;
  const params = new URLSearchParams({
    internalSymbolFull: symbol,
    fields: "instrumentId,internalSymbolFull,displayname",
    pageSize: "1",
  });

  const res = await fetch(`${ETORO_API_BASE}/market-data/search?${params}`, {
    headers,
    signal: AbortSignal.timeout(ETORO_FETCH_TIMEOUT_MS),
  });

  if (res.status === 401 || res.status === 403) throw new EtoroAuthError();
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
  keysOrHeaders: EtoroKeys | Record<string, string>,
  trade: TradeRequest
): Promise<TradeResponse> {
  const headers = isEtoroKeys(keysOrHeaders) ? buildEtoroHeaders(keysOrHeaders) : keysOrHeaders;
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

  if (res.status === 401 || res.status === 403) throw new EtoroAuthError();

  if (!res.ok) {
    await res.text().catch(() => {});
    return { success: false, error: `Trade failed (${res.status})` };
  }

  const data = await res.json().catch(() => null);
  if (!data) {
    return { success: false, error: "Trade may have executed but response was unreadable" };
  }
  return {
    success: true,
    orderId: data.orderId ?? data.OrderId ?? data.OrderID,
  };
}

export type KeyValidationResult = "valid" | "invalid" | "unreachable";

export async function validateKeys(keys: EtoroKeys): Promise<KeyValidationResult> {
  const headers = buildEtoroHeaders(keys);
  const params = new URLSearchParams({
    internalSymbolFull: "AAPL",
    fields: "instrumentId",
    pageSize: "1",
  });

  try {
    const res = await fetch(`${ETORO_API_BASE}/market-data/search?${params}`, {
      headers,
      signal: AbortSignal.timeout(ETORO_FETCH_TIMEOUT_MS),
    });

    if (res.status === 401 || res.status === 403) return "invalid";
    if (!res.ok) return "unreachable";
    return "valid";
  } catch {
    return "unreachable";
  }
}

export { ETORO_API_BASE };

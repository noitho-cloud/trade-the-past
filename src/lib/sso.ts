import { jwtVerify, createRemoteJWKSet } from "jose";
import { encrypt, decrypt } from "./encryption";

// eToro SSO endpoints
export const ETORO_SSO_URL = "https://www.etoro.com/sso";
export const ETORO_TOKEN_URL = "https://www.etoro.com/api/sso/v1/token";
export const ETORO_JWKS_URI = "https://www.etoro.com/.well-known/jwks.json";
export const ETORO_ISSUER = "https://www.etoro.com";

// Cookie names
export const SSO_SESSION_COOKIE = "ttp_sso_session";
export const SSO_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const ACCESS_REFRESH_BUFFER_MS = 60_000;

export function getSSOConfig() {
  const clientId = process.env.ETORO_SSO_CLIENT_ID;
  const clientSecret = process.env.ETORO_SSO_CLIENT_SECRET;
  const redirectUri = process.env.ETORO_SSO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return { clientId, clientSecret, redirectUri };
}

export function isSSOConfigured(): boolean {
  return getSSOConfig() !== null;
}

// --- Encrypted-cookie session store (serverless safe) ---

export interface SSOSession {
  etoroUserId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number; // unix ms
  createdAt: number;
}

/**
 * Serialize session data into an encrypted string suitable for an httpOnly cookie.
 * No server-side state — survives cold starts and scales horizontally.
 */
export function sealSession(data: Omit<SSOSession, "createdAt">): string {
  const session: SSOSession = { ...data, createdAt: Date.now() };
  return encrypt(JSON.stringify(session));
}

export function unsealSession(sealed: string): SSOSession | null {
  try {
    const parsed = JSON.parse(decrypt(sealed)) as SSOSession;
    const maxAge = SSO_COOKIE_MAX_AGE * 1000;
    if (Date.now() - parsed.createdAt > maxAge) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sealUpdatedTokens(
  session: SSOSession,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): string {
  return encrypt(
    JSON.stringify({
      ...session,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    })
  );
}

/**
 * Returns a usable access token, refreshing when near expiry.
 * Returns { token, updatedCookie } — caller must persist updatedCookie
 * if non-null (tokens were refreshed).
 */
export async function getValidAccessToken(
  sealed: string
): Promise<{ token: string; updatedCookie: string | null } | null> {
  const session = unsealSession(sealed);
  if (!session) return null;

  if (Date.now() < session.accessTokenExpiresAt - ACCESS_REFRESH_BUFFER_MS) {
    return { token: session.accessToken, updatedCookie: null };
  }

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    const updatedCookie = sealUpdatedTokens(
      session,
      refreshed.accessToken,
      refreshed.refreshToken,
      refreshed.expiresIn
    );
    return { token: refreshed.accessToken, updatedCookie };
  } catch {
    return null;
  }
}

function tokenEndpointErrorMessage(errorData: unknown): string {
  if (errorData && typeof errorData === "object" && "error" in errorData) {
    const e = (errorData as { error?: unknown }).error;
    if (typeof e === "string") return e;
    if (e !== undefined) return JSON.stringify(e);
  }
  return "";
}

// --- Token exchange ---
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<{
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const config = getSSOConfig();
  if (!config) throw new Error("SSO not configured");

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  const res = await fetch(ETORO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(tokenEndpointErrorMessage(errorData) || `Token exchange failed (${res.status})`);
  }

  const data = await res.json();
  return {
    idToken: data.id_token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 600,
  };
}

// --- Token refresh ---
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const config = getSSOConfig();
  if (!config) throw new Error("SSO not configured");

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(ETORO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(tokenEndpointErrorMessage(errorData) || `Token refresh failed (${res.status})`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 600,
  };
}

// --- ID Token validation ---
const JWKS = createRemoteJWKSet(new URL(ETORO_JWKS_URI));

export async function validateIdToken(idToken: string): Promise<string> {
  const config = getSSOConfig();
  if (!config) throw new Error("SSO not configured");

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ETORO_ISSUER,
    audience: config.clientId,
  });

  if (!payload.sub) {
    throw new Error("ID token missing sub claim");
  }

  return payload.sub;
}

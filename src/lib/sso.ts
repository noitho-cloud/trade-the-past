import { jwtVerify, createRemoteJWKSet } from "jose";

// eToro SSO endpoints
export const ETORO_SSO_URL = "https://www.etoro.com/sso";
export const ETORO_TOKEN_URL = "https://www.etoro.com/api/sso/v1/token";
export const ETORO_JWKS_URI = "https://www.etoro.com/.well-known/jwks.json";
export const ETORO_ISSUER = "https://www.etoro.com";

// Cookie names
export const SSO_SESSION_COOKIE = "ttp_sso_session";
export const SSO_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

const ACCESS_REFRESH_BUFFER_MS = 60_000;

// Get client config from env
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

// --- Server-side session store ---
interface SSOSession {
  etoroUserId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number; // unix ms
  createdAt: number;
}

const sessions = new Map<string, SSOSession>();

export function createSession(data: Omit<SSOSession, "createdAt">): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, { ...data, createdAt: Date.now() });
  return sessionId;
}

export function getSession(sessionId: string): SSOSession | null {
  return sessions.get(sessionId) ?? null;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function updateSessionTokens(
  sessionId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  const session = sessions.get(sessionId);
  if (session) {
    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    session.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
  }
}

/** Returns a usable access token, refreshing when near expiry. */
export async function getValidAccessToken(sessionId: string): Promise<string | null> {
  const session = getSession(sessionId);
  if (!session) return null;

  if (Date.now() < session.accessTokenExpiresAt - ACCESS_REFRESH_BUFFER_MS) {
    return session.accessToken;
  }

  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    updateSessionTokens(
      sessionId,
      refreshed.accessToken,
      refreshed.refreshToken,
      refreshed.expiresIn
    );
    return refreshed.accessToken;
  } catch {
    return null;
  }
}

// Cleanup expired sessions (call periodically)
export function cleanupSessions(): void {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > maxAge) {
      sessions.delete(id);
    }
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

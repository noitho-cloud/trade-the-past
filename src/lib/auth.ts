import { createRemoteJWKSet, jwtVerify } from "jose";

// ── eToro SSO Constants ──────────────────────────────────────────────
export const ETORO_SSO = {
  authorizationEndpoint: "https://www.etoro.com/sso",
  tokenEndpoint: "https://www.etoro.com/api/sso/v1/token",
  jwksEndpoint: "https://www.etoro.com/.well-known/jwks.json",
  issuer: "https://www.etoro.com",
  scope: "openid",
} as const;

export function getClientId(): string {
  return process.env.ETORO_SSO_CLIENT_ID ?? "";
}

export function getClientSecret(): string {
  return process.env.ETORO_SSO_CLIENT_SECRET ?? "";
}

export function getRedirectUri(): string {
  return process.env.ETORO_SSO_REDIRECT_URI ?? "http://localhost:3050/auth/callback";
}

// ── Session Store (in-memory, server-side only) ──────────────────────
interface Session {
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  createdAt: number;
}

const sessions = new Map<string, Session>();

const SESSION_COOKIE_NAME = "ttp_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };

export function createSession(userId: string, accessToken?: string, refreshToken?: string): string {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, {
    userId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: accessToken ? Date.now() + 10 * 60 * 1000 : undefined,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// ── ID Token Validation ─────────────────────────────────────────────
const JWKS = createRemoteJWKSet(new URL(ETORO_SSO.jwksEndpoint));

export interface ValidatedClaims {
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

export async function validateIdToken(idToken: string): Promise<ValidatedClaims> {
  const clientId = getClientId();

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ETORO_SSO.issuer,
    audience: clientId,
  });

  if (!payload.sub) {
    throw new Error("id_token missing sub claim");
  }

  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    throw new Error("id_token expired");
  }

  if (typeof payload.iat !== "number") {
    throw new Error("id_token missing iat claim");
  }

  const fiveMinutes = 5 * 60;
  if (payload.iat > Math.floor(Date.now() / 1000) + fiveMinutes) {
    throw new Error("id_token iat is in the future");
  }

  return {
    sub: payload.sub,
    iss: payload.iss as string,
    aud: (Array.isArray(payload.aud) ? payload.aud[0] : payload.aud) as string,
    exp: payload.exp,
    iat: payload.iat,
  };
}

// ── Token Exchange ──────────────────────────────────────────────────
export interface TokenResponse {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: getClientId(),
    client_secret: getClientSecret(),
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(),
    code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(ETORO_SSO.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${text}`);
  }

  return response.json();
}

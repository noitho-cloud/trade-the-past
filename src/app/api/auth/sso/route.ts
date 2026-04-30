import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  validateIdToken,
  createSession,
  deleteSession,
  isSSOConfigured,
  SSO_SESSION_COOKIE,
  SSO_COOKIE_MAX_AGE,
} from "@/lib/sso";
import { KEYS_COOKIE_NAME } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;

  if (!isSSOConfigured()) {
    return addRateLimitHeaders(
      NextResponse.json({ error: "SSO is not configured" }, { status: 501 }),
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

  const { code, code_verifier } = body as { code?: string; code_verifier?: string };

  if (!code || typeof code !== "string") {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Authorization code is required" }, { status: 400 }),
      rateLimit
    );
  }
  if (!code_verifier || typeof code_verifier !== "string") {
    return addRateLimitHeaders(
      NextResponse.json({ error: "Code verifier is required" }, { status: 400 }),
      rateLimit
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, code_verifier);
    const etoroUserId = await validateIdToken(tokens.idToken);

    const sessionId = createSession({
      etoroUserId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: Date.now() + tokens.expiresIn * 1000,
    });

    const cookieStore = await cookies();

    const prevSso = cookieStore.get(SSO_SESSION_COOKIE)?.value;
    if (prevSso) {
      deleteSession(prevSso);
    }

    cookieStore.set(SSO_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SSO_COOKIE_MAX_AGE,
      path: "/",
    });

    cookieStore.set(KEYS_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return addRateLimitHeaders(
      NextResponse.json({ success: true, userId: etoroUserId }),
      rateLimit
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("SSO token exchange failed", { route: "/api/auth/sso", error: message });

    if (message.includes("invalid_grant")) {
      return addRateLimitHeaders(
        NextResponse.json(
          {
            error:
              "Authorization code expired or already used. Please try logging in again.",
          },
          { status: 400 }
        ),
        rateLimit
      );
    }
    if (message.includes("invalid_client")) {
      return addRateLimitHeaders(
        NextResponse.json(
          {
            error: "SSO configuration error. Please contact support.",
          },
          { status: 500 }
        ),
        rateLimit
      );
    }

    return addRateLimitHeaders(
      NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 }),
      rateLimit
    );
  }
}

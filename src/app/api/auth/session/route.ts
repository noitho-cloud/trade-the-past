import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptKeys, KEYS_COOKIE_NAME } from "@/lib/auth";
import { getSession, SSO_SESSION_COOKIE } from "@/lib/sso";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export async function GET(request: Request) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;
  const cookieStore = await cookies();

  const ssoSessionId = cookieStore.get(SSO_SESSION_COOKIE)?.value;
  if (ssoSessionId) {
    const session = getSession(ssoSessionId);
    if (session) {
      return addRateLimitHeaders(
        NextResponse.json({
          connected: true,
          method: "sso",
          userId: session.etoroUserId,
        }),
        rateLimit
      );
    }
  }

  const encrypted = cookieStore.get(KEYS_COOKIE_NAME)?.value;
  if (!encrypted) {
    return addRateLimitHeaders(
      NextResponse.json({ connected: false }),
      rateLimit
    );
  }

  try {
    decryptKeys(encrypted);
    return addRateLimitHeaders(
      NextResponse.json({ connected: true, method: "apikey" }),
      rateLimit
    );
  } catch {
    return addRateLimitHeaders(
      NextResponse.json({ connected: false }),
      rateLimit
    );
  }
}

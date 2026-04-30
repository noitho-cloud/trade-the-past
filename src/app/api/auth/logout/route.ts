import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { KEYS_COOKIE_NAME } from "@/lib/auth";
import { SSO_SESSION_COOKIE, deleteSession } from "@/lib/sso";
import { applyRateLimit } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;
  const cookieStore = await cookies();

  const ssoSessionId = cookieStore.get(SSO_SESSION_COOKIE)?.value;
  if (ssoSessionId) {
    deleteSession(ssoSessionId);
  }
  cookieStore.set(SSO_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  cookieStore.set(KEYS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

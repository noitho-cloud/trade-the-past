import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { KEYS_COOKIE_NAME } from "@/lib/auth";
import { applyRateLimit } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;
  const cookieStore = await cookies();

  cookieStore.set(KEYS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ success: true });
}

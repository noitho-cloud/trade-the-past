import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptKeys, KEYS_COOKIE_NAME, KEYS_MAX_AGE } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { validateKeys } from "@/lib/etoro-proxy";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export async function POST(request: Request) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { apiKey, userKey } = body as { apiKey?: string; userKey?: string };

  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return NextResponse.json(
      { error: "API Key is required" },
      { status: 400 }
    );
  }

  if (!userKey || typeof userKey !== "string" || userKey.trim().length === 0) {
    return NextResponse.json(
      { error: "User Key is required" },
      { status: 400 }
    );
  }

  const trimmedKeys = { apiKey: apiKey.trim(), userKey: userKey.trim() };

  const validation = await validateKeys(trimmedKeys);
  if (validation === "invalid") {
    return addRateLimitHeaders(
      NextResponse.json(
        { error: "Invalid API keys. Please check your keys and try again." },
        { status: 401 }
      ),
      rateLimit
    );
  }

  try {
    const encrypted = encryptKeys(trimmedKeys);

    const cookieStore = await cookies();
    cookieStore.set(KEYS_COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: KEYS_MAX_AGE,
      path: "/",
    });

    const response = NextResponse.json({
      success: true,
      ...(validation === "unreachable" && {
        warning: "Could not verify keys — you may need to reconnect if trading fails.",
      }),
    });
    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    logger.error("Connect error", { route: "/api/auth/etoro", error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Failed to store credentials" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "./rate-limit";

type RateLimitTier = "api" | "etoro";

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export type RateLimitCheck =
  | { blocked: true; response: NextResponse }
  | { blocked: false; headers: Record<string, string> };

export function applyRateLimit(
  request: Request,
  tier: RateLimitTier = "api"
): RateLimitCheck {
  const ip = getClientIP(request);
  const limits = tier === "etoro" ? RATE_LIMITS.etoro : RATE_LIMITS.api;
  const limitKey = `${tier}:${ip}`;

  const result = checkRateLimit(limitKey, limits);

  if (!result.allowed) {
    return {
      blocked: true,
      response: NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
            "X-RateLimit-Limit": String(limits.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      ),
    };
  }

  return {
    blocked: false,
    headers: {
      "X-RateLimit-Limit": String(limits.maxRequests),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    },
  };
}

export function addRateLimitHeaders(
  response: NextResponse,
  check: RateLimitCheck & { blocked: false }
): NextResponse {
  for (const [key, value] of Object.entries(check.headers)) {
    response.headers.set(key, value);
  }
  return response;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/api/health") {
    return NextResponse.next();
  }

  const ip = getClientIP(request);
  const isEtoroRoute = pathname.startsWith("/api/etoro/");
  const limits = isEtoroRoute ? RATE_LIMITS.etoro : RATE_LIMITS.api;
  const limitKey = isEtoroRoute ? `etoro:${ip}` : `api:${ip}`;

  const result = checkRateLimit(limitKey, limits);

  if (!result.allowed) {
    return NextResponse.json(
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
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(limits.maxRequests));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  return response;
}

export const config = {
  matcher: "/api/:path*",
};

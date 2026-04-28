import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/event-service";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export async function GET(request: NextRequest) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;

  try {
    const scopeParam = request.nextUrl.searchParams.get("scope");
    const scope: "global" | "local" =
      scopeParam === "local" ? "local" : "global";

    const events = await getEvents(scope);
    const response = NextResponse.json(
      { events, scope },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Events API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}

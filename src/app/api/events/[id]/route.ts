import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/event-service";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

export const maxDuration = 30;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimit = applyRateLimit(request, "api");
  if (rateLimit.blocked) return rateLimit.response;

  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const response = NextResponse.json(
      { event },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
    return addRateLimitHeaders(response, rateLimit);
  } catch (error) {
    console.error("Event detail API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 }
    );
  }
}

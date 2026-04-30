import { NextRequest, NextResponse } from "next/server";
import { getEventById } from "@/lib/event-service";
import { logger } from "@/lib/logger";
import { applyRateLimit, addRateLimitHeaders } from "@/lib/with-rate-limit";

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
    logger.error("Event detail API error", { route: "/api/events/[id]", error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 }
    );
  }
}

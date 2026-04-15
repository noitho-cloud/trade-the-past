import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/event-service";

export async function GET(request: NextRequest) {
  try {
    const scopeParam = request.nextUrl.searchParams.get("scope");
    const scope: "global" | "local" =
      scopeParam === "local" ? "local" : "global";

    const events = await getEvents(scope);
    return NextResponse.json(
      { events, scope },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Events API error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}

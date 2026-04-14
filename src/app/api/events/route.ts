import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/event-service";

export async function GET(request: NextRequest) {
  const scope =
    (request.nextUrl.searchParams.get("scope") as "global" | "local") ||
    "global";

  const events = await getEvents(scope);
  return NextResponse.json({ events, scope });
}

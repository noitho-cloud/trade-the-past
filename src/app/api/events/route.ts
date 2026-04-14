import { NextRequest, NextResponse } from "next/server";
import { getMockEvents } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") || "global";

  const events = getMockEvents().filter(
    (e) => scope === "global" || e.source !== undefined
  );

  return NextResponse.json({ events, scope });
}

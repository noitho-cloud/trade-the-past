import { NextRequest, NextResponse } from "next/server";
import { getMockEventById } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = getMockEventById(id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

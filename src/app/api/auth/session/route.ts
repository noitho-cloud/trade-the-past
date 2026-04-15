import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return NextResponse.json({ authenticated: false });
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.userId,
  });
}

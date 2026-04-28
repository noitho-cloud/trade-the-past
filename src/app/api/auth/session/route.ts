import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptKeys, KEYS_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const encrypted = cookieStore.get(KEYS_COOKIE_NAME)?.value;

  if (!encrypted) {
    return NextResponse.json({ connected: false });
  }

  try {
    decryptKeys(encrypted);
    return NextResponse.json({ connected: true });
  } catch {
    return NextResponse.json({ connected: false });
  }
}

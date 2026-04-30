import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ETORO_SSO_CLIENT_ID || process.env.ETORO_SSO_CLIENT_ID;
  const redirectUri =
    process.env.NEXT_PUBLIC_ETORO_SSO_REDIRECT_URI || process.env.ETORO_SSO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    clientId,
    redirectUri,
  });
}

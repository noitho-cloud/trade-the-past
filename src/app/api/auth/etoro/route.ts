import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  validateIdToken,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { code, code_verifier } = await request.json();

    if (!code || !code_verifier) {
      return NextResponse.json(
        { error: "Missing code or code_verifier" },
        { status: 400 }
      );
    }

    const tokens = await exchangeCodeForTokens(code, code_verifier);

    if (!tokens.id_token) {
      return NextResponse.json(
        { error: "No id_token in response" },
        { status: 502 }
      );
    }

    const claims = await validateIdToken(tokens.id_token);

    const sessionId = createSession(
      claims.sub,
      tokens.access_token,
      tokens.refresh_token
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      userId: claims.sub,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    console.error("SSO auth error:", message);
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

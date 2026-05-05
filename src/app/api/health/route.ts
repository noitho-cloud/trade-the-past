import { NextResponse } from "next/server";
import { isSSOConfigured } from "@/lib/sso";

function checkEnvVar(name: string): boolean {
  const val = process.env[name];
  return typeof val === "string" && val.length > 0;
}

export async function GET() {
  const encryptionKey = checkEnvVar("ENCRYPTION_KEY");
  const sso = isSSOConfigured();
  const newsapi = checkEnvVar("NEWSAPI_KEY");
  const openai = checkEnvVar("OPENAI_API_KEY");

  const status = encryptionKey ? "healthy" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    services: {
      encryption: encryptionKey ? "ok" : "missing",
      sso: sso ? "configured" : "disabled",
      newsapi: newsapi ? "configured" : "disabled",
      openai: openai ? "configured" : "disabled",
    },
  });
}

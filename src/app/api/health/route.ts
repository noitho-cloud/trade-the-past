import { NextResponse } from "next/server";

const startTime = Date.now();

function checkEnvVar(name: string): boolean {
  const val = process.env[name];
  return typeof val === "string" && val.length > 0;
}

export async function GET() {
  const uptimeMs = Date.now() - startTime;

  const envChecks = {
    ENCRYPTION_KEY: checkEnvVar("ENCRYPTION_KEY"),
    NEWSAPI_KEY: checkEnvVar("NEWSAPI_KEY"),
    OPENAI_API_KEY: checkEnvVar("OPENAI_API_KEY"),
  };

  const allCriticalPresent = envChecks.ENCRYPTION_KEY;

  return NextResponse.json({
    status: allCriticalPresent ? "healthy" : "degraded",
    uptime: `${Math.floor(uptimeMs / 1000)}s`,
    timestamp: new Date().toISOString(),
    env: envChecks,
    version: process.env.npm_package_version ?? "0.1.0",
  });
}

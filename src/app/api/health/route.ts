import { NextResponse } from "next/server";

function checkEnvVar(name: string): boolean {
  const val = process.env[name];
  return typeof val === "string" && val.length > 0;
}

export async function GET() {
  const allCriticalPresent = checkEnvVar("ENCRYPTION_KEY");

  return NextResponse.json({
    status: allCriticalPresent ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
  });
}

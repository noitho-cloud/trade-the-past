import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("/api/health", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns healthy status with service breakdown", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.services.encryption).toBe("ok");
    expect(data).not.toHaveProperty("env");
    expect(data).not.toHaveProperty("uptime");
  });

  it("returns degraded status when ENCRYPTION_KEY is missing", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe("degraded");
    expect(data.services.encryption).toBe("missing");
  });

  it("does not expose internal env var names", async () => {
    vi.stubEnv("NEWSAPI_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const body = await res.text();
    expect(body).not.toContain("ENCRYPTION_KEY");
    expect(body).not.toContain("NEWSAPI_KEY");
    expect(body).not.toContain("OPENAI_API_KEY");
  });

  it("reports SSO as disabled when not configured", async () => {
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const data = await res.json();
    expect(data.services.sso).toBe("disabled");
  });
});

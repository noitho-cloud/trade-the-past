import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("/api/health", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns healthy status with env checks", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("healthy");
    expect(data.uptime).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(data.env.ENCRYPTION_KEY).toBe(true);
  });

  it("returns degraded status when ENCRYPTION_KEY is missing", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const data = await res.json();
    expect(data.status).toBe("degraded");
    expect(data.env.ENCRYPTION_KEY).toBe(false);
  });

  it("groups env vars into required and optional", async () => {
    vi.stubEnv("NEWSAPI_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.resetModules();
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    const data = await res.json();
    expect(data.env.required).toBeDefined();
    expect(data.env.optional).toBeDefined();
    expect(data.env.required.ENCRYPTION_KEY).toBe(true);
    expect(data.env.optional.NEWSAPI_KEY).toBe(false);
    expect(data.env.optional.OPENAI_API_KEY).toBe(true);
  });
});

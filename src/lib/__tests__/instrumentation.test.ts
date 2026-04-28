import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("instrumentation register()", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls validateEnv on register", async () => {
    vi.stubEnv(
      "ENCRYPTION_KEY",
      "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
    );
    vi.stubEnv("NEWSAPI_KEY", "test");
    vi.stubEnv("OPENAI_API_KEY", "test");
    const { register } = await import("../../instrumentation");
    await expect(register()).resolves.toBeUndefined();
  });

  it("throws when ENCRYPTION_KEY is missing", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    const { register } = await import("../../instrumentation");
    await expect(register()).rejects.toThrow(/ENCRYPTION_KEY/);
  });
});

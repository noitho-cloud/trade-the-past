import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns config when ENCRYPTION_KEY is valid", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
    const { validateEnv } = await import("../env");
    const config = validateEnv();
    expect(config.ENCRYPTION_KEY).toBeDefined();
  });

  it("throws when ENCRYPTION_KEY is missing", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    const { validateEnv } = await import("../env");
    expect(() => validateEnv()).toThrow(/ENCRYPTION_KEY/);
  });

  it("throws when ENCRYPTION_KEY is too short", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "tooshort");
    const { validateEnv } = await import("../env");
    expect(() => validateEnv()).toThrow(/ENCRYPTION_KEY/);
  });

  it("warns about missing optional keys", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2");
    vi.stubEnv("NEWSAPI_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { validateEnv } = await import("../env");
    const config = validateEnv();
    expect(config.NEWSAPI_KEY).toBeUndefined();
    expect(config.OPENAI_API_KEY).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("NEWSAPI_KEY"));
    warnSpy.mockRestore();
  });
});

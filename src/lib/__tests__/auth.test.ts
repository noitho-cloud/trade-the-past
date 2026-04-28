import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const TEST_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

describe("Auth — eToro API key encryption", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts and decrypts eToro keys", async () => {
    const { encryptKeys, decryptKeys } = await import("../auth");
    const keys = { apiKey: "pub-123", userKey: "user-456" };
    const encrypted = encryptKeys(keys);
    expect(typeof encrypted).toBe("string");
    expect(encrypted).not.toContain("pub-123");
    expect(decryptKeys(encrypted)).toEqual(keys);
  });

  it("exports expected cookie constants", async () => {
    const { KEYS_COOKIE_NAME, KEYS_MAX_AGE } = await import("../auth");
    expect(KEYS_COOKIE_NAME).toBe("ttp_etoro_keys");
    expect(KEYS_MAX_AGE).toBe(30 * 24 * 60 * 60);
  });
});

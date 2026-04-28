import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const TEST_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

describe("encryption", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts and decrypts a plaintext string", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const plaintext = "my-secret-api-key";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", async () => {
    const { encrypt } = await import("../encryption");
    const plaintext = "same-key";
    const a = encrypt(plaintext);
    const b = encrypt(plaintext);
    expect(a).not.toBe(b);
  });

  it("throws on tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("../encryption");
    const encrypted = encrypt("test");
    const tampered = encrypted.slice(0, -4) + "xxxx";
    expect(() => decrypt(tampered)).toThrow();
  });

  it("handles JSON-serializable objects via encryptJson/decryptJson", async () => {
    const { encryptJson, decryptJson } = await import("../encryption");
    const data = { apiKey: "pub-key-123", userKey: "user-key-456" };
    const encrypted = encryptJson(data);
    expect(typeof encrypted).toBe("string");
    expect(decryptJson(encrypted)).toEqual(data);
  });

  it("throws when ENCRYPTION_KEY is missing", async () => {
    vi.stubEnv("ENCRYPTION_KEY", "");
    vi.resetModules();
    const mod = await import("../encryption");
    expect(() => mod.encrypt("test")).toThrow(/ENCRYPTION_KEY/);
  });
});

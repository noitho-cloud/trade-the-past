import { describe, it, expect } from "vitest";
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "../pkce";

describe("PKCE utilities", () => {
  describe("generateState", () => {
    it("returns a 64-character hex string (256 bits)", () => {
      const state = generateState();
      expect(state).toHaveLength(64);
      expect(state).toMatch(/^[a-f0-9]+$/);
    });

    it("generates unique values on each call", () => {
      const states = new Set(Array.from({ length: 10 }, () => generateState()));
      expect(states.size).toBe(10);
    });
  });

  describe("generateCodeVerifier", () => {
    it("returns a 64-character string", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toHaveLength(64);
    });

    it("uses only unreserved characters [A-Za-z0-9-._~]", () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    it("generates unique values on each call", () => {
      const verifiers = new Set(Array.from({ length: 10 }, () => generateCodeVerifier()));
      expect(verifiers.size).toBe(10);
    });
  });

  describe("generateCodeChallenge", () => {
    it("returns a base64url-encoded string", async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(challenge).not.toContain("=");
      expect(challenge).not.toContain("+");
      expect(challenge).not.toContain("/");
    });

    it("returns a 43-character string for SHA-256", async () => {
      const challenge = await generateCodeChallenge("test_verifier");
      expect(challenge).toHaveLength(43);
    });

    it("produces deterministic output for same input", async () => {
      const verifier = "fixed-test-verifier-value";
      const c1 = await generateCodeChallenge(verifier);
      const c2 = await generateCodeChallenge(verifier);
      expect(c1).toBe(c2);
    });

    it("produces different output for different inputs", async () => {
      const c1 = await generateCodeChallenge("verifier-a");
      const c2 = await generateCodeChallenge("verifier-b");
      expect(c1).not.toBe(c2);
    });
  });
});

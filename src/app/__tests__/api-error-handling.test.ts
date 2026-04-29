import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const TEST_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";

vi.mock("@/lib/etoro-proxy", () => ({
  getEtoroKeys: vi.fn().mockResolvedValue({ apiKey: "k", userKey: "u" }),
  searchInstrument: vi.fn().mockResolvedValue(null),
  executeTrade: vi.fn(),
  buildEtoroHeaders: vi.fn().mockReturnValue({}),
  ETORO_API_BASE: "https://api.etoro.com",
}));

describe("API error handling", () => {
  beforeEach(() => {
    vi.stubEnv("ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("/api/auth/etoro (connect)", () => {
    it("returns 400 with clean message for empty POST body", async () => {
      const { POST } = await import("@/app/api/auth/etoro/route");
      const req = new Request("http://localhost:3050/api/auth/etoro", {
        method: "POST",
        body: null,
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid request body");
    });

    it("returns 400 with clean message for malformed JSON", async () => {
      const { POST } = await import("@/app/api/auth/etoro/route");
      const req = new Request("http://localhost:3050/api/auth/etoro", {
        method: "POST",
        body: "not valid json",
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("Invalid request body");
    });

    it("never leaks raw JS error messages", async () => {
      const { POST } = await import("@/app/api/auth/etoro/route");
      const req = new Request("http://localhost:3050/api/auth/etoro", {
        method: "POST",
        body: null,
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.error).not.toContain("Unexpected");
      expect(json.error).not.toContain("JSON");
      expect(json.error).not.toContain("SyntaxError");
    });

    it("returns 400 for valid JSON missing required fields", async () => {
      const { POST } = await import("@/app/api/auth/etoro/route");
      const req = new Request("http://localhost:3050/api/auth/etoro", {
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("API Key is required");
    });

    it("returns 400 when apiKey is provided but userKey is missing", async () => {
      const { POST } = await import("@/app/api/auth/etoro/route");
      const req = new Request("http://localhost:3050/api/auth/etoro", {
        method: "POST",
        body: JSON.stringify({ apiKey: "test-key" }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe("User Key is required");
    });
  });

  describe("eToro API routes never echo user input in error messages", () => {
    const maliciousSymbol = '<script>alert("xss")</script>';

    it("/api/etoro/trade does not echo symbol in error", async () => {
      const { POST } = await import("@/app/api/etoro/trade/route");
      const req = new Request("http://localhost:3050/api/etoro/trade", {
        method: "POST",
        body: JSON.stringify({ symbol: maliciousSymbol, isBuy: true, amount: 100 }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.error).not.toContain(maliciousSymbol);
      expect(json.error).not.toContain("<script>");
    });

    it("/api/etoro/search does not echo symbol in error", async () => {
      const { POST } = await import("@/app/api/etoro/search/route");
      const req = new Request("http://localhost:3050/api/etoro/search", {
        method: "POST",
        body: JSON.stringify({ symbol: maliciousSymbol }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.error).not.toContain(maliciousSymbol);
      expect(json.error).not.toContain("<script>");
    });

    it("/api/etoro/watchlist does not echo symbol in error", async () => {
      const { POST } = await import("@/app/api/etoro/watchlist/route");
      const req = new Request("http://localhost:3050/api/etoro/watchlist", {
        method: "POST",
        body: JSON.stringify({ symbol: maliciousSymbol }),
        headers: { "Content-Type": "application/json" },
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.error).not.toContain(maliciousSymbol);
      expect(json.error).not.toContain("<script>");
    });
  });
});

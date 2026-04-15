import { describe, it, expect } from "vitest";

describe("API error handling", () => {
  describe("/api/auth/etoro", () => {
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

    it("never leaks raw JS error messages like 'Unexpected end of JSON input'", async () => {
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
      expect(json.error).toBe("Missing code or code_verifier");
    });
  });
});

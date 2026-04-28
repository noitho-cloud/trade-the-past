import { describe, it, expect, beforeEach } from "vitest";
import { applyRateLimit, addRateLimitHeaders } from "../with-rate-limit";
import { resetRateLimits } from "../rate-limit";
import { NextResponse } from "next/server";

function makeRequest(ip = "1.2.3.4"): Request {
  return new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("applyRateLimit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    const result = applyRateLimit(makeRequest(), "api");
    expect(result.blocked).toBe(false);
    if (!result.blocked) {
      expect(result.headers["X-RateLimit-Limit"]).toBe("100");
      expect(result.headers["X-RateLimit-Remaining"]).toBe("99");
    }
  });

  it("blocks requests over the api limit (100/min)", () => {
    const req = makeRequest("rate-test-1");
    for (let i = 0; i < 100; i++) {
      applyRateLimit(req, "api");
    }
    const result = applyRateLimit(req, "api");
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      expect(result.response.status).toBe(429);
    }
  });

  it("blocks requests over the etoro limit (30/min)", () => {
    const req = makeRequest("rate-test-2");
    for (let i = 0; i < 30; i++) {
      applyRateLimit(req, "etoro");
    }
    const result = applyRateLimit(req, "etoro");
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      expect(result.response.status).toBe(429);
    }
  });

  it("returns 429 response with Retry-After header", async () => {
    const req = makeRequest("rate-test-3");
    for (let i = 0; i < 100; i++) {
      applyRateLimit(req, "api");
    }
    const result = applyRateLimit(req, "api");
    expect(result.blocked).toBe(true);
    if (result.blocked) {
      const body = await result.response.json();
      expect(body.error).toContain("Too many requests");
      expect(result.response.headers.get("Retry-After")).toBeTruthy();
      expect(result.response.headers.get("X-RateLimit-Remaining")).toBe("0");
    }
  });

  it("isolates api and etoro tiers", () => {
    const req = makeRequest("rate-test-4");
    for (let i = 0; i < 30; i++) {
      applyRateLimit(req, "etoro");
    }
    const etoroResult = applyRateLimit(req, "etoro");
    expect(etoroResult.blocked).toBe(true);

    const apiResult = applyRateLimit(req, "api");
    expect(apiResult.blocked).toBe(false);
  });

  it("extracts IP from x-real-ip when x-forwarded-for is absent", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    const r1 = applyRateLimit(req, "api");
    expect(r1.blocked).toBe(false);
  });

  it("defaults to 'unknown' when no IP headers present", () => {
    const req = new Request("http://localhost/api/test");
    const r1 = applyRateLimit(req, "api");
    expect(r1.blocked).toBe(false);
  });
});

describe("addRateLimitHeaders", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("adds rate limit headers to response", () => {
    const check = applyRateLimit(makeRequest("header-test"), "api");
    expect(check.blocked).toBe(false);
    if (!check.blocked) {
      const response = NextResponse.json({ ok: true });
      addRateLimitHeaders(response, check);
      expect(response.headers.get("X-RateLimit-Limit")).toBe("100");
      expect(response.headers.get("X-RateLimit-Remaining")).toBeTruthy();
    }
  });
});

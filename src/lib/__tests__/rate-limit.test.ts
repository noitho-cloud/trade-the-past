import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "../rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under the limit", () => {
    const opts = { windowMs: 60_000, maxRequests: 5 };
    const result = checkRateLimit("test-ip-1", opts);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("tracks request count across calls", () => {
    const opts = { windowMs: 60_000, maxRequests: 3 };
    checkRateLimit("test-ip-2", opts);
    checkRateLimit("test-ip-2", opts);
    const result = checkRateLimit("test-ip-2", opts);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("blocks when limit is exceeded", () => {
    const opts = { windowMs: 60_000, maxRequests: 2 };
    checkRateLimit("test-ip-3", opts);
    checkRateLimit("test-ip-3", opts);
    const result = checkRateLimit("test-ip-3", opts);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates different identifiers", () => {
    const opts = { windowMs: 60_000, maxRequests: 1 };
    checkRateLimit("ip-a", opts);
    const result = checkRateLimit("ip-b", opts);
    expect(result.allowed).toBe(true);
  });

  it("resets after window expires", () => {
    const opts = { windowMs: 1, maxRequests: 1 };
    checkRateLimit("test-ip-4", opts);
    const blocked = checkRateLimit("test-ip-4", opts);
    expect(blocked.allowed).toBe(false);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit("test-ip-4", opts);
        expect(result.allowed).toBe(true);
        resolve();
      }, 10);
    });
  });
});

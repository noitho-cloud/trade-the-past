import { describe, it, expect } from "vitest";
import nextConfig from "../../../next.config";

describe("next.config security headers", () => {
  it("disables X-Powered-By header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("defines a headers function", () => {
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("returns security headers for all routes", async () => {
    const headersFn = nextConfig.headers!;
    const result = await headersFn();

    expect(result.length).toBeGreaterThanOrEqual(1);

    const catchAll = result.find(
      (r: { source: string }) =>
        r.source === "/:path*" || r.source === "/(.*)"
    );
    expect(catchAll).toBeDefined();

    const headerMap = new Map(
      catchAll!.headers.map((h: { key: string; value: string }) => [
        h.key.toLowerCase(),
        h.value,
      ])
    );

    expect(headerMap.get("x-frame-options")).toBe("DENY");
    expect(headerMap.get("x-content-type-options")).toBe("nosniff");
    expect(headerMap.get("referrer-policy")).toBe(
      "origin-when-cross-origin"
    );
    expect(headerMap.get("strict-transport-security")).toContain(
      "max-age="
    );
  });
});

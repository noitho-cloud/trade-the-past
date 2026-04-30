import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("layout.tsx Vercel analytics integration", () => {
  const layoutSource = readFileSync(
    join(__dirname, "..", "layout.tsx"),
    "utf-8",
  );

  it("imports Analytics from @vercel/analytics/next", () => {
    expect(layoutSource).toContain("@vercel/analytics/next");
  });

  it("imports SpeedInsights from @vercel/speed-insights/next", () => {
    expect(layoutSource).toContain("@vercel/speed-insights/next");
  });

  it("renders the <Analytics /> component", () => {
    expect(layoutSource).toMatch(/<Analytics\s*\/>/);
  });

  it("renders the <SpeedInsights /> component", () => {
    expect(layoutSource).toMatch(/<SpeedInsights\s*\/>/);
  });
});

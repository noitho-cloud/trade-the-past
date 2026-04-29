import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("layout.tsx font preload", () => {
  const layoutSource = readFileSync(
    join(__dirname, "..", "layout.tsx"),
    "utf-8",
  );

  it("includes a preload link for the eToro variable font", () => {
    expect(layoutSource).toContain('rel="preload"');
    expect(layoutSource).toContain(
      "https://marketing.etorostatic.com/cache1/fonts/etoro/eToro-VF-v0.7.ttf",
    );
    expect(layoutSource).toContain('as="font"');
    expect(layoutSource).toContain('type="font/ttf"');
    expect(layoutSource).toContain('crossOrigin="anonymous"');
  });

  it("places the preload link before the ThemeScript component", () => {
    const preloadIndex = layoutSource.indexOf('rel="preload"');
    const themeScriptIndex = layoutSource.indexOf("<ThemeScript");
    expect(preloadIndex).toBeGreaterThan(-1);
    expect(themeScriptIndex).toBeGreaterThan(-1);
    expect(preloadIndex).toBeLessThan(themeScriptIndex);
  });

  it("uses ThemeScript component via useServerInsertedHTML instead of raw script tag", () => {
    expect(layoutSource).toContain('from "@/components/ThemeScript"');
    expect(layoutSource).toContain("<ThemeScript");
    expect(layoutSource).not.toMatch(/<script\s+dangerouslySetInnerHTML/);
    expect(layoutSource).not.toMatch(/dangerouslySetInnerHTML/);
  });
});

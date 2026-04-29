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

  it("places the preload link before the theme init script", () => {
    const preloadIndex = layoutSource.indexOf('rel="preload"');
    const themeScriptIndex = layoutSource.indexOf('id="theme-init"');
    expect(preloadIndex).toBeGreaterThan(-1);
    expect(themeScriptIndex).toBeGreaterThan(-1);
    expect(preloadIndex).toBeLessThan(themeScriptIndex);
  });

  it("uses next/script with beforeInteractive for the theme init script", () => {
    expect(layoutSource).toContain('from "next/script"');
    expect(layoutSource).toContain('id="theme-init"');
    expect(layoutSource).toContain('strategy="beforeInteractive"');
    expect(layoutSource).not.toContain("useServerInsertedHTML");
    expect(layoutSource).not.toContain("ThemeScript");
  });
});

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("layout.tsx metadata title template", () => {
  const layoutSource = readFileSync(
    join(__dirname, "..", "layout.tsx"),
    "utf-8",
  );

  it("uses a title template with brand suffix", () => {
    expect(layoutSource).toContain("template");
    expect(layoutSource).toContain("Trade the Past");
  });

  it("defines a default title for pages without their own title", () => {
    expect(layoutSource).toContain("default");
  });
});

describe("event detail page metadata", () => {
  const pageSource = readFileSync(
    join(__dirname, "..", "event", "[id]", "page.tsx"),
    "utf-8",
  );

  it("does not manually append brand suffix to the title", () => {
    expect(pageSource).not.toContain("— Trade the Past");
  });
});

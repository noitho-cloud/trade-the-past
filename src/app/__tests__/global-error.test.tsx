import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import GlobalError from "../global-error";

vi.mock("@/lib/error-reporter", () => ({
  captureException: vi.fn(),
}));

describe("global-error.tsx", () => {
  const source = readFileSync(
    join(__dirname, "..", "global-error.tsx"),
    "utf-8",
  );

  it("is a client component", () => {
    expect(source).toContain('"use client"');
  });

  it("renders its own html and body tags", () => {
    expect(source).toMatch(/<html[\s>]/);
    expect(source).toMatch(/<body[\s>]/);
  });

  it("renders a heading and try-again button", () => {
    const error = new Error("test crash");
    const reset = vi.fn();
    const { container } = render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByRole("button", { name: /try again/i })).toBeDefined();

    const html = container.closest("html");
    expect(html).toBeTruthy();
  });

  it("calls captureException on mount", async () => {
    const { captureException } = await import("@/lib/error-reporter");
    const error = new Error("layout crash");
    render(<GlobalError error={error} reset={vi.fn()} />);
    expect(captureException).toHaveBeenCalledWith(error, expect.objectContaining({ boundary: "global" }));
  });

  it("calls reset when try again is clicked", async () => {
    const reset = vi.fn();
    render(<GlobalError error={new Error("boom")} reset={reset} />);
    screen.getByRole("button", { name: /try again/i }).click();
    expect(reset).toHaveBeenCalled();
  });

  it("uses inline styles instead of CSS classes for core layout", () => {
    expect(source).toContain("style=");
  });
});

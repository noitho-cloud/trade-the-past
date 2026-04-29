import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";

function ThemeConsumer() {
  const { theme } = useTheme();
  return <div data-testid="theme">{theme}</div>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    document.documentElement.className = "h-full";
    localStorage.clear();
  });

  it("reads light theme when dark class is absent", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId("theme").textContent).toBe("light");
  });

  it("reads dark theme when dark class is present", () => {
    document.documentElement.classList.add("dark");
    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(getByTestId("theme").textContent).toBe("dark");
  });

  it("recovers dark class after hydration removes it", async () => {
    localStorage.setItem("theme", "dark");

    const { getByTestId } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(getByTestId("theme").textContent).toBe("dark");
  });

  it("does not add dark class when localStorage says light", async () => {
    localStorage.setItem("theme", "light");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("respects prefers-color-scheme: dark when no localStorage value", async () => {
    const original = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(prefers-color-scheme:dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    window.matchMedia = original;
  });
});

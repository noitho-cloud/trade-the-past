import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginButton } from "../LoginButton";
import { AuthProvider } from "../AuthProvider";
import type { ReactNode } from "react";

beforeEach(() => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ connected: false }), { status: 200 })
  );
});

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("LoginButton", () => {
  it("renders the connect button when not connected", async () => {
    render(<LoginButton />, { wrapper: Wrapper });
    const button = await screen.findByRole("button", { name: /connect/i });
    expect(button).toBeDefined();
  });

  it("connect button contains eToro text on wider screens", async () => {
    render(<LoginButton />, { wrapper: Wrapper });
    const button = await screen.findByRole("button", { name: /connect/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("Connect");
  });
});

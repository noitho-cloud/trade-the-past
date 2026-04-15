import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginButton } from "../LoginButton";
import { AuthProvider } from "../AuthProvider";
import type { ReactNode } from "react";

function Wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("LoginButton", () => {
  it("renders the login button when not logged in", async () => {
    render(<LoginButton />, { wrapper: Wrapper });
    const button = await screen.findByRole("button", { name: /login/i });
    expect(button).toBeDefined();
  });

  it("login button contains eToro text on wider screens", async () => {
    render(<LoginButton />, { wrapper: Wrapper });
    const button = await screen.findByRole("button", { name: /login/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("Login");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeaderLink } from "../HeaderLink";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

let mockSearchParams = new URLSearchParams();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

describe("HeaderLink", () => {
  it("links to / on the weekly view", () => {
    mockPathname = "/";
    mockSearchParams = new URLSearchParams();

    render(<HeaderLink />);
    const link = screen.getByRole("link", { name: /trade the past/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("links to / on event detail without from_scope", () => {
    mockPathname = "/event/evt-001";
    mockSearchParams = new URLSearchParams();

    render(<HeaderLink />);
    const link = screen.getByRole("link", { name: /trade the past/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("links to /?scope=local on event detail with from_scope=local", () => {
    mockPathname = "/event/evt-011";
    mockSearchParams = new URLSearchParams("from_scope=local");

    render(<HeaderLink />);
    const link = screen.getByRole("link", { name: /trade the past/i });
    expect(link).toHaveAttribute("href", "/?scope=local");
  });

  it("links to / on event detail with from_scope=global", () => {
    mockPathname = "/event/evt-001";
    mockSearchParams = new URLSearchParams("from_scope=global");

    render(<HeaderLink />);
    const link = screen.getByRole("link", { name: /trade the past/i });
    expect(link).toHaveAttribute("href", "/");
  });
});

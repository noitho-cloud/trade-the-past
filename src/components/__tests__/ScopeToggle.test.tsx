import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScopeToggle } from "../ScopeToggle";

describe("ScopeToggle — eToro segmented control", () => {
  it("renders Global and Local buttons", () => {
    render(<ScopeToggle scope="global" onChange={() => {}} />);
    expect(screen.getByText("Global")).toBeDefined();
    expect(screen.getByText("UK / DE / FR")).toBeDefined();
  });

  it("active segment has card background and shadow", () => {
    render(<ScopeToggle scope="global" onChange={() => {}} />);
    const globalBtn = screen.getByText("Global");
    expect(globalBtn.className).toContain("bg-[var(--card)]");
    expect(globalBtn.className).toContain("shadow-sm");
  });

  it("inactive segment is transparent with gray text", () => {
    render(<ScopeToggle scope="global" onChange={() => {}} />);
    const localBtn = screen.getByText("UK / DE / FR");
    expect(localBtn.className).toContain("bg-transparent");
    expect(localBtn.className).toContain("text-[var(--gray-text)]");
  });

  it("container is 36px height (h-9) with full rounding", () => {
    render(<ScopeToggle scope="global" onChange={() => {}} />);
    const container = screen.getByText("Global").parentElement!;
    expect(container.className).toContain("h-9");
    expect(container.className).toContain("rounded-full");
  });

  it("swaps active/inactive classes when scope changes", () => {
    render(<ScopeToggle scope="local" onChange={() => {}} />);
    const globalBtn = screen.getByText("Global");
    const localBtn = screen.getByText("UK / DE / FR");
    expect(globalBtn.className).toContain("bg-transparent");
    expect(localBtn.className).toContain("bg-[var(--card)]");
    expect(localBtn.className).toContain("shadow-sm");
  });

  it("calls onChange when buttons are clicked", () => {
    const onChange = vi.fn();
    render(<ScopeToggle scope="global" onChange={onChange} />);
    fireEvent.click(screen.getByText("UK / DE / FR"));
    expect(onChange).toHaveBeenCalledWith("local");
    fireEvent.click(screen.getByText("Global"));
    expect(onChange).toHaveBeenCalledWith("global");
  });

  it("buttons have transition duration-150", () => {
    render(<ScopeToggle scope="global" onChange={() => {}} />);
    const btn = screen.getByText("Global");
    expect(btn.className).toContain("duration-150");
  });
});

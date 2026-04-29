import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TradeDialog } from "../TradeDialog";
import { ToastProvider } from "../ToastProvider";
import type { ReactNode } from "react";

beforeEach(() => {
  vi.restoreAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe("TradeDialog", () => {
  it("shows Bullish badge and historical pattern text for direction=up", () => {
    render(
      <TradeDialog asset="Tesla" direction="up" symbol="TSLA" onClose={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("Buy (Bullish)")).toBeDefined();
    expect(screen.getByText(/based on historical patterns/i)).toBeDefined();
  });

  it("shows Bearish badge and historical pattern text for direction=down", () => {
    render(
      <TradeDialog asset="Gold" direction="down" symbol="GOLD" onClose={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("Sell (Bearish)")).toBeDefined();
    expect(screen.getByText(/based on historical patterns/i)).toBeDefined();
  });

  it("shows neutral badge and no-data text for direction=neutral", () => {
    render(
      <TradeDialog asset="UBS" direction="neutral" symbol="UBSG.Z" onClose={vi.fn()} />,
      { wrapper: Wrapper }
    );
    expect(screen.getByText("Market Order")).toBeDefined();
    expect(screen.queryByText(/bullish/i)).toBeNull();
    expect(screen.queryByText(/bearish/i)).toBeNull();
    expect(screen.queryByText(/based on historical patterns/i)).toBeNull();
    expect(screen.getByText(/no historical pattern data/i)).toBeDefined();
  });

  it("shows inline dollar sign prefix in the amount input", () => {
    render(
      <TradeDialog asset="Oil" direction="up" symbol="OIL" onClose={vi.fn()} />,
      { wrapper: Wrapper }
    );
    const input = screen.getByLabelText("Amount (USD)");
    const wrapper = input.parentElement!;
    const dollarSign = wrapper.querySelector("[aria-hidden='true']");
    expect(dollarSign).toBeTruthy();
    expect(dollarSign!.textContent).toBe("$");
  });
});

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

  it("closes when backdrop (dialog element) is clicked directly", () => {
    const onClose = vi.fn();
    render(
      <TradeDialog asset="Oil" direction="up" symbol="OIL" onClose={onClose} />,
      { wrapper: Wrapper }
    );
    const dialog = document.querySelector("dialog")!;
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when inner content is clicked", () => {
    const onClose = vi.fn();
    render(
      <TradeDialog asset="Oil" direction="up" symbol="OIL" onClose={onClose} />,
      { wrapper: Wrapper }
    );
    const heading = screen.getByText("Confirm Trade");
    heading.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("prevents double trade submission on rapid clicks", async () => {
    const calls: string[] = [];
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      () => {
        calls.push("fetch");
        return new Promise<Response>((resolve) => {
          setTimeout(() => resolve(new Response(JSON.stringify({ success: true }), { status: 200 })), 50);
        });
      }
    );

    render(
      <TradeDialog asset="Oil" direction="up" symbol="OIL" onClose={vi.fn()} />,
      { wrapper: Wrapper }
    );

    const executeBtn = screen.getAllByText("Execute Trade")[0];

    // Simulate rapid double-click by dispatching raw DOM clicks
    // that bypass React's disabled-attribute re-render
    executeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    executeBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    // Only one fetch should have been initiated
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    fetchSpy.mockRestore();
  });
});

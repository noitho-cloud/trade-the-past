import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { HistoricalSection } from "../HistoricalSection";
import { AuthProvider } from "../AuthProvider";
import { ToastProvider } from "../ToastProvider";
import type { HistoricalMatch } from "@/lib/types";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}

const mockMatch: HistoricalMatch = {
  description: "Fed pauses rate hikes",
  year: 2006,
  whySimilar: "Both events mark end of tightening cycle.",
  insight: "S&P 500 rallied 4.2% over following month.",
  reactions: [
    { asset: "S&P 500", direction: "up", day1Pct: 1.1, week1Pct: 2.3 },
  ],
};

beforeEach(() => {
  vi.restoreAllMocks();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ connected: false }), { status: 200 })
  );
});

describe("HistoricalSection", () => {
  it("renders matches when provided", () => {
    render(
      <HistoricalSection eventId="test-1" matches={[mockMatch]} />
    );

    expect(screen.getByText("What History Tells Us")).toBeDefined();
  });

  it("shows empty state with fallback assets when matches is empty and title mentions a tradeable asset", () => {
    render(
      <HistoricalSection
        eventId="test-1"
        matches={[]}
        eventTitle="Tesla stock surges after earnings beat"
        eventSummary="Tesla reported record deliveries."
      />,
      { wrapper: Wrapper }
    );

    expect(
      screen.getByText("No historical parallels found yet. Analysis updates throughout the day.")
    ).toBeDefined();
    expect(screen.getByText("Mentioned Assets")).toBeDefined();
    expect(screen.getByText("Tesla")).toBeDefined();
    expect(screen.getByRole("button", { name: /trade tesla/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /add tesla to watchlist/i })).toBeDefined();
  });

  it("does not show directional badge on mentioned asset cards when no historical data", () => {
    render(
      <HistoricalSection
        eventId="test-1"
        matches={[]}
        eventTitle="Tesla stock surges after earnings beat"
        eventSummary="Tesla reported record deliveries."
      />,
      { wrapper: Wrapper }
    );

    expect(screen.queryByText("Bullish")).toBeNull();
    expect(screen.queryByText("Bearish")).toBeNull();
  });

  it("shows browse link when no tradeable assets mentioned", () => {
    render(
      <HistoricalSection
        eventId="test-1"
        matches={[]}
        eventTitle="Central bank holds rates steady"
        eventSummary="Interest rates unchanged."
      />,
      { wrapper: Wrapper }
    );

    expect(
      screen.getByText("No historical parallels found yet. Analysis updates throughout the day.")
    ).toBeDefined();
    expect(screen.getByText("Browse events with analysis")).toBeDefined();
  });

  it("shows error state with retry button when matches is null", () => {
    render(
      <HistoricalSection eventId="test-1" matches={null} />
    );

    expect(
      screen.getByText("Could not load historical data")
    ).toBeDefined();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeDefined();
  });

  it("retry button fetches data and renders matches on success", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ event: { historicalMatches: [mockMatch] } }),
        { status: 200 }
      )
    );

    render(
      <HistoricalSection eventId="test-1" matches={null} />
    );

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryBtn);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toBe("/api/events/test-1");

    await screen.findByText("What History Tells Us");
  });

  it("retry passes an AbortSignal to the fetch call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ event: { historicalMatches: [] } }),
        { status: 200 }
      )
    );

    render(
      <HistoricalSection eventId="test-retry-signal" matches={null} />
    );

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryBtn);

    await screen.findByText("No historical parallels found yet. Analysis updates throughout the day.");

    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[1]).toBeDefined();
    expect(callArgs[1]!.signal).toBeInstanceOf(AbortSignal);
  });

  it("retry shows error again when fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error")
    );

    render(
      <HistoricalSection eventId="test-1" matches={null} />
    );

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await userEvent.click(retryBtn);

    await screen.findByText("Could not load historical data");
  });
});

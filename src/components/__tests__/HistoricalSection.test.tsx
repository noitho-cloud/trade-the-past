import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HistoricalSection } from "../HistoricalSection";
import type { HistoricalMatch } from "@/lib/types";

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
});

describe("HistoricalSection", () => {
  it("renders matches when provided", () => {
    render(
      <HistoricalSection eventId="test-1" matches={[mockMatch]} />
    );

    expect(screen.getByText("What History Tells Us")).toBeDefined();
  });

  it("shows empty state when matches is empty array", () => {
    render(
      <HistoricalSection eventId="test-1" matches={[]} />
    );

    expect(
      screen.getByText("No historical parallels found for this event.")
    ).toBeDefined();
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

    await screen.findByText("No historical parallels found for this event.");

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

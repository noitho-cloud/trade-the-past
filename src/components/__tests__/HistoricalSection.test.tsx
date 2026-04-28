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
  it("shows empty state when initialMatches is empty and API returns no matches", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ event: { historicalMatches: [] } }),
        { status: 200 }
      )
    );

    render(<HistoricalSection eventId="test-1" initialMatches={[]} />);

    const emptyMsg = await screen.findByText(
      "No historical parallels found for this event."
    );
    expect(emptyMsg).toBeDefined();
  });

  it("shows error state with retry button when API fetch fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<HistoricalSection eventId="test-1" initialMatches={[]} />);

    const errorMsg = await screen.findByText("Could not load historical data");
    expect(errorMsg).toBeDefined();

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeDefined();
  });

  it("shows error state when API returns non-OK status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 })
    );

    render(<HistoricalSection eventId="test-1" initialMatches={[]} />);

    const errorMsg = await screen.findByText("Could not load historical data");
    expect(errorMsg).toBeDefined();
  });

  it("retry button re-fetches data", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    fetchSpy.mockRejectedValueOnce(new Error("Network error"));

    render(<HistoricalSection eventId="test-1" initialMatches={[]} />);

    const retryBtn = await screen.findByRole("button", { name: /try again/i });

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ event: { historicalMatches: [mockMatch] } }),
        { status: 200 }
      )
    );

    await userEvent.click(retryBtn);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("passes an AbortSignal to the fetch call", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ event: { historicalMatches: [] } }),
        { status: 200 }
      )
    );

    render(<HistoricalSection eventId="test-signal" initialMatches={[]} />);

    await screen.findByText("No historical parallels found for this event.");

    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[1]).toBeDefined();
    expect(callArgs[1]!.signal).toBeInstanceOf(AbortSignal);
  });

  it("renders matches directly when initialMatches is provided", () => {
    render(
      <HistoricalSection eventId="test-1" initialMatches={[mockMatch]} />
    );

    expect(screen.getByText("What History Tells Us")).toBeDefined();
  });
});

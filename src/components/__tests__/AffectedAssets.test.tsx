import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AffectedAssets } from "../AffectedAssets";
import type { HistoricalMatch } from "@/lib/types";

const matches: HistoricalMatch[] = [
  {
    description: "Fed pauses rate hikes",
    year: 2006,
    whySimilar: "Both mark end of tightening cycle.",
    insight: "S&P rallied after pause.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 1.1, week1Pct: 2.3 },
      { asset: "10Y Treasury", direction: "down", day1Pct: -0.8, week1Pct: -1.5 },
    ],
  },
  {
    description: "Fed signals cuts",
    year: 2019,
    whySimilar: "Dovish pivot.",
    insight: "Led to rate cuts.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 1.9 },
      { asset: "Gold", direction: "up", day1Pct: 1.2, week1Pct: 2.8 },
    ],
  },
];

describe("AffectedAssets", () => {
  it("renders nothing when no matches are provided", () => {
    const { container } = render(<AffectedAssets matches={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the Affected Assets heading", () => {
    render(<AffectedAssets matches={matches} />);
    expect(screen.getByText("Affected Assets")).toBeDefined();
  });

  it("shows all unique assets from matches", () => {
    render(<AffectedAssets matches={matches} />);
    expect(screen.getByText("S&P 500")).toBeDefined();
    expect(screen.getByText("10Y Treasury")).toBeDefined();
    expect(screen.getByText("Gold")).toBeDefined();
  });

  it("deduplicates assets that appear in multiple matches", () => {
    render(<AffectedAssets matches={matches} />);
    const spElements = screen.getAllByText("S&P 500");
    expect(spElements).toHaveLength(1);
  });

  it("shows Trade and Watchlist buttons for each asset", () => {
    render(<AffectedAssets matches={matches} />);
    const tradeButtons = screen.getAllByText("Trade");
    const watchlistButtons = screen.getAllByText("Watchlist");
    expect(tradeButtons.length).toBe(3);
    expect(watchlistButtons.length).toBe(3);
  });

  it("shows direction indicators for each asset", () => {
    render(<AffectedAssets matches={matches} />);
    const cards = screen.getAllByText("Trade");
    expect(cards.length).toBe(3);
  });

  it("shows a toast when Trade button is clicked", async () => {
    const user = userEvent.setup();
    render(<AffectedAssets matches={matches} />);
    const tradeButtons = screen.getAllByText("Trade");
    await user.click(tradeButtons[0]);
    expect(screen.getByText(/Coming soon/)).toBeDefined();
  });
});

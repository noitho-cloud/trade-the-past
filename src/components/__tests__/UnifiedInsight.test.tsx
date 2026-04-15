import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnifiedInsight } from "../UnifiedInsight";
import type { HistoricalMatch } from "@/lib/types";

const singleMatch: HistoricalMatch[] = [
  {
    description: "Fed pauses rate hikes after 10 consecutive increases",
    year: 2006,
    whySimilar:
      "Both events mark the end of a tightening cycle with forward guidance suggesting easing ahead.",
    insight:
      "After the 2006 pause, the S&P 500 rallied 4.2% over the following month.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 1.1, week1Pct: 2.3 },
      { asset: "Gold", direction: "up", day1Pct: 0.9, week1Pct: 1.8 },
    ],
  },
];

const twoMatches: HistoricalMatch[] = [
  ...singleMatch,
  {
    description: "Fed signals rate cuts amid trade war concerns",
    year: 2019,
    whySimilar:
      "Similar dovish pivot in response to economic uncertainty.",
    insight: "The 2019 pivot led to three rate cuts and a 10% equity rally.",
    reactions: [
      { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 1.9 },
      { asset: "Gold", direction: "up", day1Pct: 1.2, week1Pct: 2.8 },
    ],
  },
];

const contradictoryMatches: HistoricalMatch[] = [
  {
    description: "OPEC agrees to historic production cut of 1.2M barrels per day",
    year: 2016,
    whySimilar: "Both are major OPEC production cut agreements.",
    insight: "Oil prices rallied 15% in the month following the 2016 deal.",
    reactions: [
      { asset: "Brent Crude", direction: "up", day1Pct: 4.5, week1Pct: 8.2 },
      { asset: "ExxonMobil", direction: "up", day1Pct: 2.8, week1Pct: 5.6 },
    ],
  },
  {
    description: "Saudi Arabia launches oil price war, crude crashes 30%",
    year: 2020,
    whySimilar: "Opposite outcome from the same dynamic.",
    insight: "The 2020 crash showed dependency on OPEC+ coordination.",
    reactions: [
      { asset: "Brent Crude", direction: "down", day1Pct: -24.1, week1Pct: -19.8 },
      { asset: "ExxonMobil", direction: "down", day1Pct: -18.2, week1Pct: -15.3 },
    ],
  },
];

describe("UnifiedInsight", () => {
  it("renders nothing when no matches are provided", () => {
    const { container } = render(<UnifiedInsight matches={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders a single unified section heading", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    expect(screen.getByText("What History Tells Us")).toBeDefined();
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(1);
  });

  it("shows a unified narrative paragraph instead of separate year blocks", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    const narrative = screen.getByText(/In similar past events/);
    expect(narrative).toBeDefined();
  });

  it("shows a consolidated market reaction table with all assets", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    expect(screen.getByText("Consolidated Market Reaction")).toBeDefined();
    expect(screen.getByText("S&P 500")).toBeDefined();
    expect(screen.getByText("Gold")).toBeDefined();
  });

  it("works correctly with a single match", () => {
    render(<UnifiedInsight matches={singleMatch} />);
    expect(screen.getByText("What History Tells Us")).toBeDefined();
    expect(screen.getByText("S&P 500")).toBeDefined();
  });

  it("deduplicates assets that appear in multiple matches", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    const spCells = screen.getAllByText("S&P 500");
    expect(spCells).toHaveLength(1);
  });

  it("always shows a single consolidated table even with contradictory data", () => {
    render(<UnifiedInsight matches={contradictoryMatches} />);
    const tables = screen.getAllByRole("table");
    expect(tables.length).toBe(1);
    expect(screen.getByText("Consolidated Market Reaction")).toBeDefined();
  });

  it("shows Key Takeaway section", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    expect(screen.getByText("Key Takeaway")).toBeDefined();
  });

  it("preserves capitalization in the narrative for proper nouns", () => {
    render(<UnifiedInsight matches={twoMatches} />);
    const narrative = screen.getByText(/In similar past events/);
    expect(narrative.textContent).toContain("Fed pauses rate hikes");
    expect(narrative.textContent).toContain("Fed signals rate cuts");
  });

  it("preserves capitalization in single-match narrative", () => {
    render(<UnifiedInsight matches={singleMatch} />);
    const narrative = screen.getByText(/In a similar past event/);
    expect(narrative.textContent).toContain("Fed pauses rate hikes");
  });
});

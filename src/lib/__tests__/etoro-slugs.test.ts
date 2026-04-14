import { describe, it, expect } from "vitest";
import {
  isEtoroTradeable,
  filterTradeableReactions,
  getEtoroTradeUrl,
  getEtoroWatchlistUrl,
} from "../etoro-slugs";

describe("isEtoroTradeable", () => {
  it("returns true for known tradeable assets", () => {
    expect(isEtoroTradeable("S&P 500")).toBe(true);
    expect(isEtoroTradeable("Gold")).toBe(true);
    expect(isEtoroTradeable("Tesla")).toBe(true);
    expect(isEtoroTradeable("FTSE 100")).toBe(true);
    expect(isEtoroTradeable("GBP/USD")).toBe(true);
    expect(isEtoroTradeable("DAX")).toBe(true);
    expect(isEtoroTradeable("ExxonMobil")).toBe(true);
  });

  it("returns false for non-tradeable assets", () => {
    expect(isEtoroTradeable("10Y Treasury")).toBe(false);
    expect(isEtoroTradeable("USD Index")).toBe(false);
    expect(isEtoroTradeable("UK 10Y Gilt")).toBe(false);
    expect(isEtoroTradeable("STOXX 600 Tech")).toBe(false);
    expect(isEtoroTradeable("Euro STOXX Banks")).toBe(false);
    expect(isEtoroTradeable("Lynas Rare Earths")).toBe(false);
    expect(isEtoroTradeable("Toyota Motor")).toBe(false);
    expect(isEtoroTradeable("USD/CNY")).toBe(false);
    expect(isEtoroTradeable("S&P 500 Energy")).toBe(false);
    expect(isEtoroTradeable("Airlines ETF (JETS)")).toBe(false);
  });
});

describe("filterTradeableReactions", () => {
  it("keeps only tradeable assets", () => {
    const reactions = [
      { asset: "S&P 500", direction: "up" as const, day1Pct: 1.1, week1Pct: 2.3 },
      { asset: "10Y Treasury", direction: "down" as const, day1Pct: -0.8, week1Pct: -1.5 },
      { asset: "Gold", direction: "up" as const, day1Pct: 1.2, week1Pct: 2.8 },
    ];
    const filtered = filterTradeableReactions(reactions);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.asset)).toEqual(["S&P 500", "Gold"]);
  });

  it("returns empty array when no assets are tradeable", () => {
    const reactions = [
      { asset: "Lynas Rare Earths", direction: "up" as const, day1Pct: 8.5, week1Pct: 22.3 },
      { asset: "USD/CNY", direction: "up" as const, day1Pct: 0.3, week1Pct: 0.8 },
    ];
    const filtered = filterTradeableReactions(reactions);
    expect(filtered).toHaveLength(0);
  });

  it("returns all when everything is tradeable", () => {
    const reactions = [
      { asset: "Tesla", direction: "up" as const, day1Pct: 3.2, week1Pct: 7.8 },
      { asset: "Microsoft", direction: "up" as const, day1Pct: 0.5, week1Pct: 1.2 },
    ];
    const filtered = filterTradeableReactions(reactions);
    expect(filtered).toHaveLength(2);
  });
});

describe("getEtoroTradeUrl", () => {
  it("returns correct URL for known assets", () => {
    expect(getEtoroTradeUrl("S&P 500")).toBe("https://www.etoro.com/markets/spx500");
    expect(getEtoroTradeUrl("Gold")).toBe("https://www.etoro.com/markets/gold");
  });

  it("generates fallback URL for unknown assets", () => {
    expect(getEtoroTradeUrl("Unknown Asset")).toBe("https://www.etoro.com/markets/unknownasset");
  });
});

describe("getEtoroWatchlistUrl", () => {
  it("returns generic watchlists URL when no asset given", () => {
    expect(getEtoroWatchlistUrl()).toBe("https://www.etoro.com/watchlists");
  });

  it("returns asset-specific market page for known assets", () => {
    expect(getEtoroWatchlistUrl("Gold")).toBe("https://www.etoro.com/markets/gold");
    expect(getEtoroWatchlistUrl("S&P 500")).toBe("https://www.etoro.com/markets/spx500");
  });

  it("generates fallback URL for unknown assets", () => {
    expect(getEtoroWatchlistUrl("Unknown Asset")).toBe("https://www.etoro.com/markets/unknownasset");
  });
});

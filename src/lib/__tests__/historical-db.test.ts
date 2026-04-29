import { describe, it, expect } from "vitest";
import { findHistoricalMatches } from "../historical-db";

describe("findHistoricalMatches", () => {
  it("BOJ rate hold matches BOJ-specific or central-bank-hold entries", () => {
    const matches = findHistoricalMatches(
      "Bank of Japan keeps policy rate steady while raising inflation forecast on Iran war worries",
      "interest-rates",
      "The decision to keep rates steady came in a split 6-3 vote"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasBOJOrCentralBankHold = descriptions.some(
      (d) => d.includes("boj") || d.includes("bank of japan") || d.includes("holds") || d.includes("hold")
    );
    expect(hasBOJOrCentralBankHold).toBe(true);
  });

  it("BOJ rate hold does NOT match EU AI Act", () => {
    const matches = findHistoricalMatches(
      "Bank of Japan keeps policy rate steady while raising inflation forecast on Iran war worries",
      "interest-rates",
      "The decision to keep rates steady came in a split 6-3 vote"
    );

    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasAIAct = descriptions.some((d) => d.includes("ai act"));
    expect(hasAIAct).toBe(false);
  });

  it("Fed rate cut matches Fed rate entries", () => {
    const matches = findHistoricalMatches(
      "Federal Reserve cuts interest rate by 25 basis points",
      "interest-rates",
      "The Fed lowered rates citing cooling inflation and labor market softening"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasFedRate = descriptions.some((d) => d.includes("fed"));
    expect(hasFedRate).toBe(true);
  });

  it("Iran conflict matches Iran-specific entries, not random wars", () => {
    const matches = findHistoricalMatches(
      "Iran launches missile strikes on US bases in Iraq",
      "geopolitical",
      "Tehran retaliates after Soleimani killing with ballistic missile attacks"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasIranEntry = descriptions.some(
      (d) => d.includes("iran") || d.includes("soleimani") || d.includes("hormuz")
    );
    expect(hasIranEntry).toBe(true);
  });

  it("vague text still returns fallback matches from the event type", () => {
    const matches = findHistoricalMatches(
      "Markets move on various factors",
      "earnings",
      "Several things happened today that affected stock prices"
    );

    expect(matches.length).toBeGreaterThan(0);
  });

  it("returns at most 3 matches", () => {
    const matches = findHistoricalMatches(
      "Federal Reserve raises rates by 75 basis points citing inflation",
      "interest-rates",
      "The hawkish Fed decision signals more rate hikes ahead as Powell warns of persistent inflation"
    );

    expect(matches.length).toBeLessThanOrEqual(3);
  });

  it("tariff events match trade war entries", () => {
    const matches = findHistoricalMatches(
      "Trump announces new tariffs on Chinese goods",
      "geopolitical",
      "The tariff escalation marks a new phase in the trade war between US and China"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasTradeWar = descriptions.some(
      (d) => d.includes("tariff") || d.includes("trade war") || d.includes("china")
    );
    expect(hasTradeWar).toBe(true);
  });

  it("jet fuel bidding war matches airline/fuel historical entries", () => {
    const matches = findHistoricalMatches(
      "Jet fuel bidding war breaks out as airlines confront global stress test",
      "commodity-shocks",
      "Airlines are scrambling for jet fuel as refinery output falls short of demand"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasAirlineOrFuel = descriptions.some(
      (d) =>
        d.includes("jet fuel") ||
        d.includes("airline") ||
        d.includes("oil") ||
        d.includes("aviation")
    );
    expect(hasAirlineOrFuel).toBe(true);
  });

  it("airline fuel cost headlines match commodity-shock entries", () => {
    const matches = findHistoricalMatches(
      "Airlines face rising fuel costs as oil prices surge past $100",
      "commodity-shocks",
      "Major carriers warn of fare hikes as jet fuel prices hit multi-year highs"
    );

    expect(matches.length).toBeGreaterThan(0);
  });

  it("BOJ acronym title matches BOJ entries via synonym expansion", () => {
    const matches = findHistoricalMatches(
      "BOJ keeps interest rates steady, lifts inflation forecast",
      "interest-rates",
      "The central bank held rates steady in a widely expected decision"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasBOJ = descriptions.some(
      (d) => d.includes("boj") || d.includes("bank of japan")
    );
    expect(hasBOJ).toBe(true);
  });

  it("Turkish central bank matches emerging market entries", () => {
    const matches = findHistoricalMatches(
      "Turkish central bank keeps key policy rate unchanged again",
      "interest-rates",
      "The CBRT held its benchmark rate at 50% as expected"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasTurkeyOrEM = descriptions.some(
      (d) =>
        d.includes("turkey") ||
        d.includes("cbrt") ||
        d.includes("emerging") ||
        d.includes("lira")
    );
    expect(hasTurkeyOrEM).toBe(true);
  });

  it("never returns an empty array", () => {
    const matches = findHistoricalMatches(
      "Something completely unrelated to anything",
      "interest-rates",
      "No keywords match at all"
    );

    expect(matches.length).toBeGreaterThan(0);
  });

  it("jet fuel shortage matches aviation disruption entries", () => {
    const matches = findHistoricalMatches(
      "Jet fuel shortages are hitting the European travel market",
      "commodity-shocks",
      "Refinery closures and pipeline disruptions are squeezing jet fuel supply across Europe"
    );

    expect(matches.length).toBeGreaterThan(0);
    const descriptions = matches.map((m) => m.description.toLowerCase());
    const hasFuelOrAviation = descriptions.some(
      (d) =>
        d.includes("jet fuel") ||
        d.includes("airline") ||
        d.includes("oil") ||
        d.includes("volcano")
    );
    expect(hasFuelOrAviation).toBe(true);
  });
});

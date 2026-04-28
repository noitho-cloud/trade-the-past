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

  it("filters out low-quality matches — returns empty for vague text", () => {
    const matches = findHistoricalMatches(
      "Markets move on various factors",
      "earnings",
      "Several things happened today that affected stock prices"
    );

    expect(matches.length).toBe(0);
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
});

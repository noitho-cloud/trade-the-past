import { describe, it, expect } from "vitest";
import { getMockEvents, MOCK_EVENTS } from "../mock-data";
import { isEtoroTradeable } from "../etoro-slugs";

describe("getMockEvents", () => {
  it("returns all events when no scope is specified", () => {
    const events = getMockEvents();
    expect(events.length).toBe(MOCK_EVENTS.length);
  });

  it("returns all events for global scope", () => {
    const events = getMockEvents("global");
    expect(events.length).toBe(
      MOCK_EVENTS.filter((e) => e.scope === "global").length
    );
    events.forEach((e) => {
      const source = MOCK_EVENTS.find((m) => m.id === e.id);
      expect(source?.scope).toBe("global");
    });
  });

  it("returns only local events for local scope", () => {
    const events = getMockEvents("local");
    expect(events.length).toBe(
      MOCK_EVENTS.filter((e) => e.scope === "local").length
    );
    events.forEach((e) => {
      const source = MOCK_EVENTS.find((m) => m.id === e.id);
      expect(source?.scope).toBe("local");
    });
  });

  it("returns MarketEventSummary shape without scope field", () => {
    const events = getMockEvents("global");
    events.forEach((e) => {
      expect(e).toHaveProperty("id");
      expect(e).toHaveProperty("title");
      expect(e).toHaveProperty("type");
      expect(e).toHaveProperty("date");
      expect(e).toHaveProperty("imageUrl");
      expect(e).toHaveProperty("source");
      expect(e).not.toHaveProperty("scope");
      expect(e).not.toHaveProperty("historicalMatches");
    });
  });

  it("only references eToro-tradeable assets in mock data reactions", () => {
    const nonTradeable: string[] = [];
    for (const event of MOCK_EVENTS) {
      for (const match of event.historicalMatches) {
        for (const reaction of match.reactions) {
          if (!isEtoroTradeable(reaction.asset)) {
            nonTradeable.push(`${event.id}: ${reaction.asset}`);
          }
        }
      }
    }
    expect(nonTradeable).toEqual([]);
  });

  it("keyReaction on summaries only uses tradeable assets", () => {
    const events = getMockEvents();
    for (const event of events) {
      if (event.keyReaction) {
        expect(
          isEtoroTradeable(event.keyReaction.asset),
          `keyReaction asset "${event.keyReaction.asset}" on ${event.id} is not tradeable on eToro`
        ).toBe(true);
      }
    }
  });
});

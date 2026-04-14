import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("event-service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("falls back to mock data when NEWSAPI_KEY is missing", async () => {
    delete process.env.NEWSAPI_KEY;
    const { getEvents } = await import("../event-service");
    const events = await getEvents("global");
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].id).toMatch(/^evt-/);
  });

  it("falls back to mock data for event detail when id is not live-prefixed", async () => {
    const { getEventById } = await import("../event-service");
    const event = await getEventById("evt-001");
    expect(event).toBeDefined();
    expect(event!.title).toBeTruthy();
    expect(event!.historicalMatches.length).toBeGreaterThan(0);
  });

  it("returns undefined for non-existent event ids", async () => {
    const { getEventById } = await import("../event-service");
    const event = await getEventById("nonexistent-id-12345");
    expect(event).toBeUndefined();
  });

  it("uses mock data when API call fails", async () => {
    process.env.NEWSAPI_KEY = "test-key-that-will-fail";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const { getEvents } = await import("../event-service");
    const events = await getEvents("global");
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].id).toMatch(/^evt-/);

    vi.unstubAllGlobals();
  });
});

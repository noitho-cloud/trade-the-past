import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../rss-client", () => ({
  fetchRSSHeadlines: vi.fn(),
}));

describe("event-service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("falls back to mock data when all sources fail", async () => {
    delete process.env.NEWSAPI_KEY;
    const { fetchRSSHeadlines } = await import("../rss-client");
    vi.mocked(fetchRSSHeadlines).mockRejectedValue(new Error("fail"));
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
    const { fetchRSSHeadlines } = await import("../rss-client");
    vi.mocked(fetchRSSHeadlines).mockRejectedValue(new Error("fail"));
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

  it("populates keyReaction from historical DB for live events", async () => {
    delete process.env.NEWSAPI_KEY;
    const { fetchRSSHeadlines } = await import("../rss-client");
    vi.mocked(fetchRSSHeadlines).mockResolvedValue([
      {
        title: "Fed raises interest rates by 25 basis points",
        description: "The Federal Reserve raised rates citing inflation concerns",
        url: "https://example.com/fed",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { id: null, name: "Reuters" },
      },
    ]);

    const { getEvents } = await import("../event-service");
    const events = await getEvents("global");

    expect(events.length).toBeGreaterThan(0);
    const liveEvent = events.find((e) => e.id.startsWith("live-"));
    expect(liveEvent).toBeDefined();
    expect(liveEvent!.keyReaction).not.toBeNull();
    expect(liveEvent!.keyReaction!.asset).toBeTruthy();
    expect(typeof liveEvent!.keyReaction!.day1Pct).toBe("number");
    expect(["up", "down"]).toContain(liveEvent!.keyReaction!.direction);
  });

  it("returns empty historicalMatches when skipHistorical is true", async () => {
    const { getEventById } = await import("../event-service");
    const event = await getEventById("evt-001", { skipHistorical: true });
    expect(event).toBeDefined();
    expect(event!.title).toBeTruthy();
    expect(event!.historicalMatches).toEqual([]);
  });

  it("returns historicalMatches when skipHistorical is not set", async () => {
    const { getEventById } = await import("../event-service");
    const event = await getEventById("evt-001");
    expect(event).toBeDefined();
    expect(event!.historicalMatches.length).toBeGreaterThan(0);
  });

  it("includes scope in live event IDs to avoid cross-scope collisions", async () => {
    delete process.env.NEWSAPI_KEY;
    const { fetchRSSHeadlines } = await import("../rss-client");
    vi.mocked(fetchRSSHeadlines).mockResolvedValue([
      {
        title: "Fed raises interest rates by 25 basis points",
        description: "The Federal Reserve raised rates citing inflation concerns",
        url: "https://example.com/fed",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { id: null, name: "Reuters" },
      },
    ]);

    const { getEvents } = await import("../event-service");
    const globalEvents = await getEvents("global");
    const globalLive = globalEvents.find((e) => e.id.startsWith("live-"));
    expect(globalLive).toBeDefined();
    expect(globalLive!.id).toMatch(/^live-global-/);
  });

  it("warmAlternateScope warms the cache for the opposite scope", async () => {
    delete process.env.NEWSAPI_KEY;
    const { fetchRSSHeadlines } = await import("../rss-client");
    vi.mocked(fetchRSSHeadlines).mockResolvedValue([
      {
        title: "Oil prices surge on OPEC production cut",
        description: "Crude jumps after surprise output reduction",
        url: "https://example.com/oil",
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { id: null, name: "Reuters" },
      },
    ]);

    const { warmAlternateScope, getEvents } = await import("../event-service");

    await warmAlternateScope("global");

    const calls = vi.mocked(fetchRSSHeadlines).mock.calls;
    const localCall = calls.find((c) => c[0] === "local");
    expect(localCall).toBeDefined();

    const localEvents = await getEvents("local");
    expect(localEvents.length).toBeGreaterThan(0);
  });
});

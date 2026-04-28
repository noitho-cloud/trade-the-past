import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("rss-client parseFeed error handling", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns empty items when fetch throws a network error", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new TypeError("fetch failed")
    );

    const { fetchRSSHeadlines } = await import("../rss-client");
    const articles = await fetchRSSHeadlines("global");

    expect(Array.isArray(articles)).toBe(true);
  });

  it("does not propagate TLS errors to the caller", async () => {
    const tlsError = new Error(
      "Hostname/IP does not match certificate's altnames"
    );
    (tlsError as NodeJS.ErrnoException).code = "ERR_TLS_CERT_ALTNAME_INVALID";

    globalThis.fetch = vi.fn().mockRejectedValue(tlsError);

    const { fetchRSSHeadlines } = await import("../rss-client");
    await expect(fetchRSSHeadlines("global")).resolves.not.toThrow();
  });

  it("logs a warning when a feed fetch fails", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    globalThis.fetch = vi.fn().mockRejectedValue(
      new TypeError("fetch failed")
    );

    const { fetchRSSHeadlines } = await import("../rss-client");
    await fetchRSSHeadlines("global");

    const warnCalls = warnSpy.mock.calls.flat().join(" ");
    expect(warnCalls).toContain("RSS feed unavailable");
  });
});

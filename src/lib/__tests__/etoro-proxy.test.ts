import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

describe("etoro-proxy", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("searchInstrument passes an abort signal to fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ Items: [{ instrumentId: 1, displayname: "AAPL", internalSymbolFull: "AAPL" }] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchInstrument } = await import("../etoro-proxy");
    await searchInstrument(
      { apiKey: "test-api", userKey: "test-user" },
      "AAPL"
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchOptions = mockFetch.mock.calls[0][1];
    expect(fetchOptions.signal).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("executeTrade passes an abort signal to fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: 123 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { executeTrade } = await import("../etoro-proxy");
    const result = await executeTrade(
      { apiKey: "test-api", userKey: "test-user" },
      { instrumentId: 1, isBuy: true, amount: 100, isDemo: true }
    );

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const fetchOptions = mockFetch.mock.calls[0][1];
    expect(fetchOptions.signal).toBeDefined();

    vi.unstubAllGlobals();
  });

  it("searchInstrument throws on timeout so the route can handle it", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError"));
    vi.stubGlobal("fetch", mockFetch);

    const { searchInstrument } = await import("../etoro-proxy");
    await expect(
      searchInstrument({ apiKey: "test-api", userKey: "test-user" }, "AAPL")
    ).rejects.toThrow();

    vi.unstubAllGlobals();
  });

  it("executeTrade throws on timeout so the route can handle it", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError"));
    vi.stubGlobal("fetch", mockFetch);

    const { executeTrade } = await import("../etoro-proxy");
    await expect(
      executeTrade(
        { apiKey: "test-api", userKey: "test-user" },
        { instrumentId: 1, isBuy: true, amount: 100, isDemo: true }
      )
    ).rejects.toThrow();

    vi.unstubAllGlobals();
  });

  it("executeTrade uses demo endpoint by default", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ orderId: 456 }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { executeTrade } = await import("../etoro-proxy");
    await executeTrade(
      { apiKey: "test-api", userKey: "test-user" },
      { instrumentId: 1, isBuy: true, amount: 100 }
    );

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain("/demo/");

    vi.unstubAllGlobals();
  });

  it("searchInstrument throws EtoroAuthError on 401", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchInstrument, EtoroAuthError } = await import("../etoro-proxy");
    await expect(
      searchInstrument({ apiKey: "bad-key", userKey: "bad-user" }, "AAPL")
    ).rejects.toThrow(EtoroAuthError);

    vi.unstubAllGlobals();
  });

  it("searchInstrument throws EtoroAuthError on 403", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchInstrument, EtoroAuthError } = await import("../etoro-proxy");
    await expect(
      searchInstrument({ apiKey: "bad-key", userKey: "bad-user" }, "AAPL")
    ).rejects.toThrow(EtoroAuthError);

    vi.unstubAllGlobals();
  });

  it("searchInstrument returns null on other non-200 (not auth error)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { searchInstrument } = await import("../etoro-proxy");
    const result = await searchInstrument({ apiKey: "key", userKey: "user" }, "AAPL");
    expect(result).toBeNull();

    vi.unstubAllGlobals();
  });

  it("validateKeys returns 'valid' when eToro responds 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ Items: [] }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const { validateKeys } = await import("../etoro-proxy");
    const result = await validateKeys({ apiKey: "good-key", userKey: "good-user" });
    expect(result).toBe("valid");

    vi.unstubAllGlobals();
  });

  it("validateKeys returns 'invalid' on 401", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { validateKeys } = await import("../etoro-proxy");
    const result = await validateKeys({ apiKey: "bad-key", userKey: "bad-user" });
    expect(result).toBe("invalid");

    vi.unstubAllGlobals();
  });

  it("validateKeys returns 'invalid' on 403", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    vi.stubGlobal("fetch", mockFetch);

    const { validateKeys } = await import("../etoro-proxy");
    const result = await validateKeys({ apiKey: "bad-key", userKey: "bad-user" });
    expect(result).toBe("invalid");

    vi.unstubAllGlobals();
  });

  it("validateKeys returns 'unreachable' on network error", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    const { validateKeys } = await import("../etoro-proxy");
    const result = await validateKeys({ apiKey: "key", userKey: "user" });
    expect(result).toBe("unreachable");

    vi.unstubAllGlobals();
  });

  it("validateKeys returns 'unreachable' on timeout", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError"));
    vi.stubGlobal("fetch", mockFetch);

    const { validateKeys } = await import("../etoro-proxy");
    const result = await validateKeys({ apiKey: "key", userKey: "user" });
    expect(result).toBe("unreachable");

    vi.unstubAllGlobals();
  });
});

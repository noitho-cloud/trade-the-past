import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ClientRequest } from "node:http";

function makeReq(): ClientRequest {
  const req = new EventEmitter() as unknown as ClientRequest;
  req.destroy = vi.fn();
  return req;
}

function makeRes(statusCode: number, body = "", headers: Record<string, string> = {}): IncomingMessage {
  const res = new EventEmitter() as unknown as IncomingMessage;
  res.statusCode = statusCode;
  res.headers = headers;
  res.resume = vi.fn();
  if (statusCode >= 200 && statusCode < 300 && body) {
    process.nextTick(() => {
      res.emit("data", Buffer.from(body));
      res.emit("end");
    });
  }
  return res;
}

const mockHttpsGet = vi.fn();
const mockHttpGet = vi.fn();

vi.mock("node:https", () => ({ get: mockHttpsGet, default: { get: mockHttpsGet } }));
vi.mock("node:http", () => ({ get: mockHttpGet, default: { get: mockHttpGet } }));

describe("rss-client parseFeed error handling", () => {
  beforeEach(() => {
    vi.resetModules();

    const xml = `<rss><channel><item><title>Test Article Title Here Long Enough</title><link>http://example.com</link><pubDate>2026-04-28T00:00:00Z</pubDate></item></channel></rss>`;

    mockHttpsGet.mockImplementation((_url: string, _opts: unknown, cb: (res: IncomingMessage) => void) => {
      const req = makeReq();
      process.nextTick(() => cb(makeRes(200, xml)));
      return req;
    });

    mockHttpGet.mockImplementation((_url: string, _opts: unknown, cb: (res: IncomingMessage) => void) => {
      const req = makeReq();
      process.nextTick(() => cb(makeRes(200, xml)));
      return req;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns articles when feeds respond successfully", async () => {
    const { fetchRSSHeadlines } = await import("../rss-client");
    const articles = await fetchRSSHeadlines("global");
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
  });

  it("handles network errors gracefully without throwing", async () => {
    mockHttpsGet.mockImplementation(() => {
      const req = makeReq();
      process.nextTick(() => req.emit("error", new Error("connect ECONNREFUSED")));
      return req;
    });

    const { fetchRSSHeadlines } = await import("../rss-client");
    const articles = await fetchRSSHeadlines("global");
    expect(Array.isArray(articles)).toBe(true);
  });

  it("handles TLS certificate errors without throwing", async () => {
    mockHttpsGet.mockImplementation(() => {
      const req = makeReq();
      const err = new Error("Hostname/IP does not match certificate's altnames");
      (err as NodeJS.ErrnoException).code = "ERR_TLS_CERT_ALTNAME_INVALID";
      process.nextTick(() => req.emit("error", err));
      return req;
    });

    const { fetchRSSHeadlines } = await import("../rss-client");
    const articles = await fetchRSSHeadlines("global");
    expect(Array.isArray(articles)).toBe(true);
  });

  it("returns empty items for HTTP error status codes", async () => {
    mockHttpsGet.mockImplementation((_url: string, _opts: unknown, cb: (res: IncomingMessage) => void) => {
      const req = makeReq();
      process.nextTick(() => cb(makeRes(500)));
      return req;
    });

    const { fetchRSSHeadlines } = await import("../rss-client");
    const articles = await fetchRSSHeadlines("global");
    expect(Array.isArray(articles)).toBe(true);
  });
});

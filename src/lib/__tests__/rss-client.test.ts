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

describe("stripSourceSuffix", () => {
  let stripSourceSuffix: (title: string) => string;

  beforeEach(async () => {
    const mod = await import("../rss-client");
    stripSourceSuffix = mod.stripSourceSuffix;
  });

  it("strips short publisher names like ' - PBS'", () => {
    expect(stripSourceSuffix("Fed Chair Powell holds briefing on interest rate decision - PBS"))
      .toBe("Fed Chair Powell holds briefing on interest rate decision");
  });

  it("strips multi-word publisher names like ' - The Washington Post'", () => {
    expect(stripSourceSuffix("UAE to leave OPEC amid crisis - The Washington Post"))
      .toBe("UAE to leave OPEC amid crisis");
  });

  it("strips ' - CBS News'", () => {
    expect(stripSourceSuffix("Iran war stuck in limbo as Trump mulls offer - CBS News"))
      .toBe("Iran war stuck in limbo as Trump mulls offer");
  });

  it("strips publishers with dots like ' - Nation.Cymru'", () => {
    expect(stripSourceSuffix("Bank of England set to hold rates - Nation.Cymru"))
      .toBe("Bank of England set to hold rates");
  });

  it("strips ' - facebook.com'", () => {
    expect(stripSourceSuffix("BSP raises key policy rate by 25 bps to 4.5% - facebook.com"))
      .toBe("BSP raises key policy rate by 25 bps to 4.5%");
  });

  it("does not strip if remaining title would be too short", () => {
    expect(stripSourceSuffix("Short - The Washington Post"))
      .toBe("Short - The Washington Post");
  });

  it("does not strip when there is no ' - ' separator", () => {
    expect(stripSourceSuffix("Fed raises rates and markets react strongly"))
      .toBe("Fed raises rates and markets react strongly");
  });

  it("handles dashes within the title body (only strips last occurrence)", () => {
    expect(stripSourceSuffix("U.S.-Iran war evolves into naval standoff - CNBC"))
      .toBe("U.S.-Iran war evolves into naval standoff");
  });

  it("strips long institutional source names up to 10 words", () => {
    expect(stripSourceSuffix("The Day in Trade: Industry questions alleged UK-EU SPS agreement benefits - The Chartered Institute of Export & International Trade"))
      .toBe("The Day in Trade: Industry questions alleged UK-EU SPS agreement benefits");
  });

  it("does not strip suffixes longer than 10 words that look like content", () => {
    expect(stripSourceSuffix("Market update - and here is a very long continuation of the story that keeps going on and on"))
      .toBe("Market update - and here is a very long continuation of the story that keeps going on and on");
  });

  it("returns the title unchanged when it is empty", () => {
    expect(stripSourceSuffix("")).toBe("");
  });

  it("strips pipe-separated publisher names like ' | Daily Sabah'", () => {
    expect(stripSourceSuffix("Turkish central bank keeps key policy rate unchanged again | Daily Sabah"))
      .toBe("Turkish central bank keeps key policy rate unchanged again");
  });

  it("strips pipe-separated single-word publishers like ' | Reuters'", () => {
    expect(stripSourceSuffix("ECB holds rates steady amid uncertainty | Reuters"))
      .toBe("ECB holds rates steady amid uncertainty");
  });

  it("does not strip pipe-separated long suffixes that look like content", () => {
    expect(stripSourceSuffix("Markets react | and here is a very long continuation of the story that keeps going on and on"))
      .toBe("Markets react | and here is a very long continuation of the story that keeps going on and on");
  });

  it("does not strip pipe if remaining title would be too short", () => {
    expect(stripSourceSuffix("Short | BBC"))
      .toBe("Short | BBC");
  });

  it("prefers the rightmost separator when both dash and pipe exist", () => {
    expect(stripSourceSuffix("U.S.-Iran war - naval standoff develops | CNBC"))
      .toBe("U.S.-Iran war - naval standoff develops");
  });

  it("strips cascading suffixes (pipe then dash from same source)", () => {
    expect(stripSourceSuffix("Turkish central bank keeps key policy rate unchanged again | Daily Sabah - Daily Sabah"))
      .toBe("Turkish central bank keeps key policy rate unchanged again");
  });

  it("strips cascading suffixes (dash then pipe)", () => {
    expect(stripSourceSuffix("Oil prices surge on Hormuz tensions - Reuters | Reuters"))
      .toBe("Oil prices surge on Hormuz tensions");
  });

  it("strips triple cascading suffixes", () => {
    expect(stripSourceSuffix("ECB holds rates steady | Investing - Investing.com - Google News"))
      .toBe("ECB holds rates steady");
  });

  it("stops stripping cascading suffixes when remaining title would be too short", () => {
    expect(stripSourceSuffix("Rates hold | FT - Financial Times"))
      .toBe("Rates hold | FT");
  });
});

describe("stripSourcePrefix", () => {
  let stripSourcePrefix: (title: string) => string;

  beforeEach(async () => {
    const mod = await import("../rss-client");
    stripSourcePrefix = mod.stripSourcePrefix;
  });

  it("strips camelCase branded column prefix before colon", () => {
    expect(stripSourcePrefix("investingLive Americas FX news wrap: Dovish BoJ's Ueda, ECB inflation expectations surge"))
      .toBe("Dovish BoJ's Ueda, ECB inflation expectations surge");
  });

  it("does not strip editorial colons where first word is not camelCase", () => {
    expect(stripSourcePrefix("Fed Chair: We will hold rates steady amid inflation concerns"))
      .toBe("Fed Chair: We will hold rates steady amid inflation concerns");
  });

  it("does not strip when first word is all lowercase", () => {
    expect(stripSourcePrefix("breaking: Major earthquake hits Pacific coast killing dozens"))
      .toBe("breaking: Major earthquake hits Pacific coast killing dozens");
  });

  it("does not strip when first word is all uppercase", () => {
    expect(stripSourcePrefix("BREAKING: Oil prices surge after attack on Saudi pipeline"))
      .toBe("BREAKING: Oil prices surge after attack on Saudi pipeline");
  });

  it("does not strip when remaining text would be too short", () => {
    expect(stripSourcePrefix("investingLive Wrap: Short text"))
      .toBe("investingLive Wrap: Short text");
  });

  it("does not strip when colon is beyond 6th word", () => {
    expect(stripSourcePrefix("investingLive Americas Weekly FX Macro Long Term news wrap: Dovish BoJ's Ueda"))
      .toBe("investingLive Americas Weekly FX Macro Long Term news wrap: Dovish BoJ's Ueda");
  });

  it("returns empty string unchanged", () => {
    expect(stripSourcePrefix("")).toBe("");
  });

  it("returns title without colon unchanged", () => {
    expect(stripSourcePrefix("investingLive Americas FX news wrap without any colon"))
      .toBe("investingLive Americas FX news wrap without any colon");
  });
});

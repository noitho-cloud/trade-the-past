import type { RawArticle } from "./news-client";
import { logger } from "./logger";
import { get as httpsGet } from "node:https";
import { get as httpGet } from "node:http";

interface RSSItem {
  title?: string;
  contentSnippet?: string;
  content?: string;
  link?: string;
  isoDate?: string;
  creator?: string;
  enclosure?: { url?: string };
  "media:content"?: { $?: { url?: string } };
}

interface RSSFeed {
  items: RSSItem[];
  title?: string;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildGoogleNewsSearchUrl(
  query: string,
  afterDate: string,
  beforeDate: string,
  lang: string = "en-US",
  gl: string = "US"
): string {
  const q = encodeURIComponent(`${query} after:${afterDate} before:${beforeDate}`);
  return `https://news.google.com/rss/search?q=${q}&hl=${lang}&gl=${gl}&ceid=${gl}:${lang.split("-")[0]}`;
}

function getDailySearchFeeds(scope: "global" | "local"): { url: string; source: string }[] {
  const feeds: { url: string; source: string }[] = [];
  const now = new Date();
  const queries = scope === "global"
    ? ["stocks OR earnings OR market", "oil OR gold OR commodity OR energy", "war OR sanctions OR tariff OR military", "fed OR interest rate OR inflation OR central bank"]
    : ["UK economy OR FTSE", "Europe market OR ECB"];
  const lang = scope === "global" ? "en-US" : "en-GB";
  const gl = scope === "global" ? "US" : "GB";

  for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
    const after = new Date(now);
    after.setDate(after.getDate() - daysAgo - 1);
    const before = new Date(now);
    before.setDate(before.getDate() - daysAgo);

    const afterStr = formatDate(after);
    const beforeStr = formatDate(before);

    for (const query of queries) {
      feeds.push({
        url: buildGoogleNewsSearchUrl(query, afterStr, beforeStr, lang, gl),
        source: `Google News`,
      });
    }
  }

  return feeds;
}

const STATIC_FEEDS: Record<string, { url: string; source: string }[]> = {
  global: [
    { url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", source: "Google News" },
    { url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", source: "Google News Business" },
    { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", source: "Yahoo Finance" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", source: "CNBC" },
    { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362", source: "CNBC World" },
    { url: "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best", source: "Reuters" },
    { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
    { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
  ],
  local: [
    { url: "https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en", source: "Google News UK" },
    { url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pIUWlnQVAB?hl=en-GB&gl=GB&ceid=GB:en", source: "Google News UK Business" },
    { url: "https://feeds.bbci.co.uk/news/rss.xml", source: "BBC News" },
    { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business" },
    { url: "https://news.google.com/rss?hl=en&gl=DE&ceid=DE:en", source: "Google News DE" },
  ],
};

function getAllFeeds(scope: "global" | "local"): { url: string; source: string }[] {
  return [...STATIC_FEEDS[scope], ...getDailySearchFeeds(scope)];
}

function nativeGet(url: string, timeoutMs: number): Promise<string | null> {
  return new Promise((resolve) => {
    const getter = url.startsWith("https") ? httpsGet : httpGet;
    const req = getter(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TradeThePast/1.0; +https://trade-the-past.vercel.app)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        timeout: timeoutMs,
      },
      (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          resolve(null);
          return;
        }
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          nativeGet(res.headers.location, timeoutMs).then(resolve);
          return;
        }
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => resolve(data));
        res.on("error", () => resolve(null));
      }
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function parseFeed(url: string): Promise<RSSFeed> {
  try {
    const xml = await nativeGet(url, 8000);
    if (!xml) return { items: [] };
    return parseXML(xml);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`RSS feed unavailable: ${url}`, { error: msg });
    return { items: [] };
  }
}

function parseXML(xml: string): RSSFeed {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      contentSnippet:
        extractTag(block, "description") || extractTag(block, "content:encoded"),
      link: extractTag(block, "link"),
      isoDate:
        extractTag(block, "pubDate") || extractTag(block, "dc:date"),
      creator: extractTag(block, "dc:creator") || extractTag(block, "author"),
      enclosure: extractEnclosureUrl(block),
    });
  }

  return {
    items,
    title: extractTag(xml, "title") || undefined,
  };
}

function extractTag(xml: string, tag: string): string | undefined {
  const cdataRegex = new RegExp(
    `<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`,
    "i"
  );
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return decodeEntities(cdataMatch[1].trim());

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = regex.exec(xml);
  if (m) return decodeEntities(m[1].trim());

  return undefined;
}

function extractEnclosureUrl(
  xml: string
): { url?: string } | undefined {
  const encMatch = /url=["']([^"']+)["']/.exec(
    (/<enclosure[^>]+>/i.exec(xml) || [""])[0]
  );
  if (encMatch) return { url: encMatch[1] };

  const mediaMatch = /url=["']([^"']+)["']/.exec(
    (/<media:content[^>]+>/i.exec(xml) || [""])[0]
  );
  if (mediaMatch) return { url: mediaMatch[1] };

  return undefined;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/<[^>]+>/g, "");
}

export function stripSourceSuffix(title: string): string {
  if (!title) return title;
  const idx = title.lastIndexOf(" - ");
  if (idx < 0) return title;
  const suffix = title.slice(idx + 3).trim();
  const wordCount = suffix.split(/\s+/).length;
  if (wordCount > 5) return title;
  const stripped = title.slice(0, idx).trim();
  if (stripped.length < 15) return title;
  return stripped;
}

function rssItemToArticle(
  item: RSSItem,
  feedSource: string
): RawArticle | null {
  if (!item.title) return null;

  let title = item.title.trim();
  if (feedSource.startsWith("Google News")) {
    title = stripSourceSuffix(title);
  }
  if (title.length < 15) return null;

  const imageUrl =
    item.enclosure?.url ||
    item["media:content"]?.$?.url ||
    null;

  return {
    title,
    description: item.contentSnippet?.slice(0, 500) || null,
    url: item.link || "",
    urlToImage: imageUrl,
    publishedAt: item.isoDate
      ? new Date(item.isoDate).toISOString()
      : new Date().toISOString(),
    source: { id: null, name: feedSource },
  };
}

export async function fetchRSSHeadlines(
  scope: "global" | "local"
): Promise<RawArticle[]> {
  const feeds = getAllFeeds(scope);

  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const parsed = await parseFeed(feed.url);
      return parsed.items
        .map((item) => rssItemToArticle(item, feed.source))
        .filter((a): a is RawArticle => a !== null);
    })
  );

  const articles = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().trim().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

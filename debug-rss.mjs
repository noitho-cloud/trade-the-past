const feeds = [
  { url: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", source: "Google News" },
  { url: "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en", source: "Google News Business" },
  { url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", source: "CNBC" },
  { url: "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC&region=US&lang=en-US", source: "Yahoo Finance" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" },
];

function extractTag(xml, tag) {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim().replace(/<[^>]+>/g, "");
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = regex.exec(xml);
  if (m) return m[1].trim().replace(/<[^>]+>/g, "");
  return undefined;
}

for (const feed of feeds) {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; test)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) { console.log(`${feed.source}: HTTP ${res.status}`); continue; }
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
    console.log(`\n${feed.source}: ${items.length} items`);
    items.slice(0, 3).forEach(m => {
      const title = extractTag(m[1], "title");
      console.log(`  - ${(title || "?").slice(0, 90)}`);
    });
  } catch (e) {
    console.log(`${feed.source}: ERROR ${e.message}`);
  }
}

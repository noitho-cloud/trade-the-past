export interface RawArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { id: string | null; name: string };
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: RawArticle[];
}

const NEWSAPI_BASE = "https://newsapi.org/v2";

const COUNTRY_MAP: Record<string, string[]> = {
  global: ["us"],
  local: ["gb", "de", "fr"],
};

export async function fetchHeadlines(
  scope: "global" | "local",
  apiKey: string
): Promise<RawArticle[]> {
  const countries = COUNTRY_MAP[scope] || COUNTRY_MAP.global;
  const results: RawArticle[] = [];

  for (const country of countries) {
    const url = `${NEWSAPI_BASE}/top-headlines?country=${country}&category=business&pageSize=20&apiKey=${apiKey}`;
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) continue;
      const data: NewsAPIResponse = await res.json();
      if (data.status === "ok") {
        results.push(...data.articles);
      }
    } catch {
      continue;
    }
  }

  return deduplicateArticles(results);
}

function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

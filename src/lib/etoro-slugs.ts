const ASSET_TO_SLUG: Record<string, string> = {
  "S&P 500": "spx500",
  Gold: "gold",
  Oil: "oil",
  "Brent Crude": "oil",
  "Natural Gas": "naturalgas",
  TSLA: "tsla",
  Tesla: "tsla",
  "ARKK ETF": "arkk",
  "Meta (Facebook)": "meta",
  Meta: "meta",
  Microsoft: "msft",
  BP: "bp.l",
  "iShares Clean Energy ETF": "icln",
  GE: "ge",
  "Alphabet (Google)": "googl",
  Amazon: "amzn",
  Salesforce: "crm",
  "FTSE 100": "uk100",
  "GBP/USD": "gbpusd",
  "EUR/USD": "eurusd",
  Volkswagen: "vow3.de",
  DAX: "gdaxi",
  "Deutsche Bank": "dbk.de",
  TotalEnergies: "tte.pa",
  "CAC 40": "fchi",
  "Euro STOXX 50": "eustx50",
  ExxonMobil: "xom",
  Bitcoin: "btc",
  Ethereum: "eth",
  Apple: "aapl",
  Nvidia: "nvda",
  "USD/JPY": "usdjpy",
  Netflix: "nflx",
  Chevron: "cvx",
  Shell: "shel.l",
};

const ETORO_BASE = "https://www.etoro.com";

export function isEtoroTradeable(assetName: string): boolean {
  return assetName in ASSET_TO_SLUG;
}

export function getEtoroTradeUrl(assetName: string): string {
  const slug = ASSET_TO_SLUG[assetName];
  if (slug) return `${ETORO_BASE}/markets/${slug}`;
  const fallbackSlug = assetName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${ETORO_BASE}/markets/${fallbackSlug}`;
}

export function getEtoroWatchlistUrl(assetName?: string): string {
  if (!assetName) return `${ETORO_BASE}/watchlists`;
  const slug = ASSET_TO_SLUG[assetName];
  if (slug) return `${ETORO_BASE}/markets/${slug}`;
  const fallbackSlug = assetName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${ETORO_BASE}/markets/${fallbackSlug}`;
}

export interface MarketReactionLike {
  asset: string;
  direction: "up" | "down";
  day1Pct: number;
  week1Pct: number;
}

export function filterTradeableReactions<T extends MarketReactionLike>(
  reactions: T[]
): T[] {
  return reactions.filter((r) => isEtoroTradeable(r.asset));
}

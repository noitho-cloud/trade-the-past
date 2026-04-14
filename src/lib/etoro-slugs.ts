const ASSET_TO_SLUG: Record<string, string> = {
  "S&P 500": "spx500",
  "S&P 500 Energy": "spx500",
  "10Y Treasury": "us10y",
  "USD Index": "usdollar",
  Gold: "gold",
  TSLA: "tsla",
  Tesla: "tsla",
  "ARKK ETF": "arkk",
  "STOXX 600 Tech": "eustx50",
  "Meta (Facebook)": "meta",
  Microsoft: "msft",
  BP: "bp.l",
  "Brent Crude": "oil",
  "iShares Clean Energy ETF": "icln",
  GE: "ge",
  "Lynas Rare Earths": "lnas.au",
  "Toyota Motor": "tm",
  "USD/CNY": "usdcny",
  "Alphabet (Google)": "googl",
  Amazon: "amzn",
  Salesforce: "crm",
  "FTSE 100": "uk100",
  "GBP/USD": "gbpusd",
  "UK 10Y Gilt": "uk10y",
  Volkswagen: "vow3.de",
  DAX: "gdaxi",
  "Deutsche Bank": "dbk.de",
  "Euro STOXX Banks": "eustx50",
  TotalEnergies: "tte.pa",
  "CAC 40": "fchi",
  "European Natural Gas": "naturalgas",
  ExxonMobil: "xom",
  "Airlines ETF (JETS)": "jets",
};

const ETORO_BASE = "https://www.etoro.com";

export function getEtoroTradeUrl(assetName: string): string {
  const slug = ASSET_TO_SLUG[assetName];
  if (slug) return `${ETORO_BASE}/markets/${slug}`;
  const fallbackSlug = assetName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${ETORO_BASE}/markets/${fallbackSlug}`;
}

export function getEtoroWatchlistUrl(): string {
  return `${ETORO_BASE}/watchlists`;
}

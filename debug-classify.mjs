const RULES = [
  { type: "earnings", keywords: ["earnings","revenue","profit","quarterly results","beats estimates","misses estimates","tops estimates","eps","guidance","fiscal year","net income","q1 ","q2 ","q3 ","q4 ","first quarter","second quarter","third quarter","fourth quarter","raises guidance","beats expectations","report earnings","results beat","sales growth","ipo","stock jumps","stock surges","shares jump","shares surge","shares rise","shares fall","stock falls","market cap"], weight: 1.0 },
  { type: "layoffs", keywords: ["layoff","lay off","job cuts","restructuring","downsizing","workforce reduction","redundancies","furlough","headcount","cost cutting","cut jobs","cutting jobs","slash jobs","eliminate positions"], weight: 1.1 },
  { type: "lawsuits", keywords: ["lawsuit","sued","sues","litigation","settlement","antitrust","fine","penalty","regulatory action","investigation","indictment","fraud","class action","court ruling","court rules","guilty","verdict","prosecution","ftc","doj","sec charges"], weight: 1.0 },
  { type: "regulation", keywords: ["regulation","regulatory","legislation","bill passed","act signed","compliance","ban","mandate","rule change","policy","ai act"], weight: 1.2 },
  { type: "interest-rates", keywords: ["interest rate","rate hike","rate cut","federal reserve","fed","central bank","monetary policy","ecb","bank of england","inflation","basis points"], weight: 1.3 },
  { type: "geopolitical", keywords: ["sanctions","tariff","trade war","embargo","export control","geopolitical","nato","military","strait of hormuz","hormuz","blockade","naval","invasion","missile","airstrike","nuclear","suez canal","ceasefire","troops","houthi","red sea","south china sea","pentagon","weapons","arms deal","treaty","escalation","retaliation","insurgent","coup","un security council"], weight: 1.3 },
  { type: "commodity-shocks", keywords: ["oil price","oil tumbles","oil surges","oil spikes","crude","brent","opec","commodity","gold price","gold hits","gold surges","rare earth","supply chain","shortage","natural gas","wheat","copper","oil supply","shipping lane","disruption","supply disruption","refinery","barrel","bpd","production cut","fuel","energy crisis","energy shock","supply shock","pipeline","jet fuel","gasoline","oil forecast","drilling","north sea oil"], weight: 1.2 },
];

function classify(title, desc) {
  const text = `${title} ${desc || ""}`.toLowerCase();
  let bestType = null, bestScore = 0;
  for (const rule of RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) { if (text.includes(kw)) matchCount++; }
    if (matchCount === 0) continue;
    const score = (matchCount / rule.keywords.length) * rule.weight;
    if (score > bestScore) { bestScore = score; bestType = rule.type; }
  }
  if (!bestType || bestScore < 0.03) return null;
  return { type: bestType, score: bestScore };
}

function extractTag(xml, tag) {
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim().replace(/<[^>]+>/g, "");
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = regex.exec(xml);
  if (m) return m[1].trim().replace(/<[^>]+>/g, "");
  return undefined;
}

const url = "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114";
const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
const xml = await res.text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

let matched = 0, unmatched = 0;
for (const m of items) {
  const title = extractTag(m[1], "title") || "";
  const desc = extractTag(m[1], "description") || "";
  const result = classify(title, desc);
  if (result) {
    matched++;
    console.log(`[${result.type.padEnd(16)}] ${title.slice(0, 85)}`);
  } else {
    unmatched++;
    console.log(`[UNMATCHED       ] ${title.slice(0, 85)}`);
  }
}
console.log(`\nMatched: ${matched}, Unmatched: ${unmatched} out of ${items.length}`);

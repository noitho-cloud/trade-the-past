import type { HistoricalMatch, EventType } from "./types";

interface HistoricalEntry extends HistoricalMatch {
  tags: string[];
}

const DB: Record<EventType, HistoricalEntry[]> = {
  layoffs: [
    {
      description: "Meta lays off 11,000 employees (13% of workforce)",
      year: 2022,
      whySimilar:
        "Large-scale tech layoffs driven by over-hiring during the pandemic boom followed by a shift to cost discipline.",
      insight:
        "Meta stock surged 23% in the week after the announcement as investors rewarded the pivot to efficiency. Layoffs at mature tech firms are often seen as bullish signals.",
      tags: ["meta", "facebook", "tech", "social media", "cost cutting", "restructuring"],
      reactions: [
        { asset: "Meta", direction: "up", day1Pct: 5.2, week1Pct: 23.1 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.4, week1Pct: 1.8 },
      ],
    },
    {
      description: "Twitter cuts 50% of staff after Elon Musk acquisition",
      year: 2022,
      whySimilar:
        "Aggressive headcount reduction following an ownership change, aimed at slashing costs and restructuring operations.",
      insight:
        "While Twitter was private, peers like Meta and Snap rose as the market interpreted industry-wide cuts as a return to profitability focus.",
      tags: ["twitter", "x", "musk", "social media", "tech", "acquisition"],
      reactions: [
        { asset: "Tesla", direction: "down", day1Pct: -3.1, week1Pct: -8.7 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.2, week1Pct: 1.3 },
      ],
    },
    {
      description: "IBM announces 3,900 job cuts as part of spin-off restructuring",
      year: 2023,
      whySimilar:
        "Legacy tech company restructuring to focus on cloud and AI, cutting jobs in declining business units.",
      insight:
        "IBM stock rose 3% on the day as investors saw the cuts as a step toward higher-margin businesses. Companies shedding legacy operations tend to re-rate upward.",
      tags: ["ibm", "cloud", "ai", "enterprise", "legacy", "spin-off"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.3, week1Pct: 0.9 },
        { asset: "Microsoft", direction: "up", day1Pct: 0.8, week1Pct: 2.1 },
      ],
    },
    {
      description: "Amazon lays off 18,000+ employees across corporate roles",
      year: 2023,
      whySimilar:
        "Major tech employer cutting thousands amid slowing e-commerce growth and macro uncertainty, signaling industry-wide belt-tightening.",
      insight:
        "Amazon stock rose 4% in the following week. Mass layoffs at tech giants in 2023 were consistently rewarded by markets as a sign of cost discipline.",
      tags: ["amazon", "ecommerce", "tech", "retail", "cost cutting", "corporate"],
      reactions: [
        { asset: "Amazon", direction: "up", day1Pct: 2.4, week1Pct: 4.1 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.5, week1Pct: 1.6 },
      ],
    },
    {
      description: "Disney lays off 7,000 as CEO Iger returns to cut costs",
      year: 2023,
      whySimilar:
        "Entertainment giant cutting workforce under a returning CEO focused on profitability over growth, especially in streaming.",
      insight:
        "Disney stock jumped 5% on the restructuring plan. When legacy media companies pivot from subscriber growth to profitability, investors tend to reward the discipline.",
      tags: ["disney", "streaming", "entertainment", "media", "ceo", "iger", "cost cutting"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.3, week1Pct: 1.2 },
        { asset: "Nvidia", direction: "up", day1Pct: 1.1, week1Pct: 3.4 },
      ],
    },
    {
      description: "Google parent Alphabet lays off 12,000 employees",
      year: 2023,
      whySimilar:
        "Search and cloud giant conducting its largest-ever layoffs, reflecting a sector-wide reset after years of rapid hiring.",
      insight:
        "Alphabet stock gained 5.4% in the following week. The layoffs reinforced a narrative that Big Tech was finally getting serious about margins.",
      tags: ["google", "alphabet", "search", "cloud", "tech", "advertising"],
      reactions: [
        { asset: "Alphabet (Google)", direction: "up", day1Pct: 3.5, week1Pct: 5.4 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.6, week1Pct: 2.0 },
      ],
    },
  ],

  earnings: [
    {
      description: "Apple beats Q4 2023 estimates on strong iPhone 15 demand",
      year: 2023,
      whySimilar:
        "Tech mega-cap posting better-than-expected revenue driven by a flagship product refresh cycle.",
      insight:
        "Apple rallied 3% and lifted the entire tech sector. Strong earnings from market leaders often set the tone for the broader market.",
      tags: ["apple", "iphone", "tech", "consumer", "revenue beat", "guidance"],
      reactions: [
        { asset: "Apple", direction: "up", day1Pct: 3.0, week1Pct: 4.8 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.7, week1Pct: 1.5 },
      ],
    },
    {
      description: "Nvidia Q3 2024 revenue triples on AI chip demand surge",
      year: 2024,
      whySimilar:
        "Semiconductor company posting massive earnings beat driven by an industry-transforming demand shift (AI/data centers).",
      insight:
        "Nvidia jumped 8% and dragged the entire chip sector higher. When a company captures a paradigm shift, its earnings surprise tends to re-rate the whole value chain.",
      tags: ["nvidia", "ai", "semiconductor", "chip", "data center", "gpu", "asml", "amd"],
      reactions: [
        { asset: "Nvidia", direction: "up", day1Pct: 8.3, week1Pct: 12.1 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.9, week1Pct: 2.3 },
      ],
    },
    {
      description: "Tesla misses Q3 2024 delivery estimates, margin pressure mounts",
      year: 2024,
      whySimilar:
        "EV leader missing forecasts as price cuts erode margins, raising questions about demand saturation.",
      insight:
        "Tesla dropped 9% in a week as margin compression spooked investors. When growth stocks miss on both volume and margin, the sell-off tends to be amplified.",
      tags: ["tesla", "ev", "auto", "delivery", "miss", "margin", "price cut"],
      reactions: [
        { asset: "Tesla", direction: "down", day1Pct: -4.2, week1Pct: -9.1 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.3, week1Pct: -0.7 },
      ],
    },
    {
      description: "JPMorgan Chase beats Q1 2024 estimates on strong trading revenue",
      year: 2024,
      whySimilar:
        "Major bank posting strong earnings driven by trading activity and net interest income, setting the tone for the financial sector.",
      insight:
        "JPMorgan's beat lifted the entire banking sector. When the largest bank beats, it signals healthy credit conditions and strong deal flow.",
      tags: ["jpmorgan", "bank", "trading", "financial", "citigroup", "goldman", "wells fargo", "earnings beat"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.5, week1Pct: 1.3 },
        { asset: "Gold", direction: "down", day1Pct: -0.3, week1Pct: -0.8 },
      ],
    },
    {
      description: "ASML Q4 2023 beats expectations on strong EUV bookings from AI demand",
      year: 2023,
      whySimilar:
        "Semiconductor equipment maker beating estimates as chip manufacturers ramp capacity for AI workloads.",
      insight:
        "ASML rose 6% and boosted the entire chip supply chain. Equipment makers beating signals sustained capex from foundries, a leading indicator for the sector.",
      tags: ["asml", "semiconductor", "euv", "chip", "ai", "equipment", "tsmc", "foundry"],
      reactions: [
        { asset: "Nvidia", direction: "up", day1Pct: 2.1, week1Pct: 5.4 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.6, week1Pct: 1.8 },
      ],
    },
    {
      description: "ASML raises full-year guidance citing strong AI and advanced chip demand",
      year: 2024,
      whySimilar:
        "Chip equipment maker lifting guidance signals sustained spending on AI infrastructure, confirming the AI buildout has legs.",
      insight:
        "ASML rose 5% on the guidance raise, pulling the semiconductor supply chain higher. Guidance lifts from equipment makers are more bullish than earnings beats because they signal forward demand.",
      tags: ["asml", "guidance", "lift", "raise", "semiconductor", "chip", "ai", "demand", "strong", "equipment", "euv", "order"],
      reactions: [
        { asset: "Nvidia", direction: "up", day1Pct: 3.2, week1Pct: 6.8 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 2.2 },
      ],
    },
    {
      description: "Netflix adds 13 million subscribers in Q4 2023, crushing estimates",
      year: 2023,
      whySimilar:
        "Streaming company posting a massive subscriber beat after launching an ad-supported tier and cracking down on password sharing.",
      insight:
        "Netflix surged 11% as the subscriber growth proved the ad tier and password-sharing crackdown were working. Pivots to monetization are rewarded when the numbers validate the strategy.",
      tags: ["netflix", "streaming", "subscriber", "advertising", "media", "entertainment"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.4, week1Pct: 1.2 },
        { asset: "Apple", direction: "up", day1Pct: 0.7, week1Pct: 1.5 },
      ],
    },
  ],

  geopolitical: [
    {
      description: "Russia invades Ukraine, triggering energy crisis in Europe",
      year: 2022,
      whySimilar:
        "Full-scale military invasion disrupting energy supplies and triggering sanctions, causing commodity spikes and market sell-offs.",
      insight:
        "Oil spiked 30% in weeks while European stocks fell sharply. Gold surged as a safe haven. Wars involving major commodity exporters cause immediate supply shock pricing.",
      tags: ["russia", "ukraine", "war", "invasion", "energy", "gas", "europe", "sanctions", "nato"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 7.8, week1Pct: 18.5 },
        { asset: "Gold", direction: "up", day1Pct: 3.2, week1Pct: 6.4 },
        { asset: "S&P 500", direction: "down", day1Pct: -1.8, week1Pct: -2.9 },
        { asset: "EUR/USD", direction: "down", day1Pct: -0.9, week1Pct: -2.1 },
      ],
    },
    {
      description: "Iran seizes oil tankers in the Strait of Hormuz",
      year: 2023,
      whySimilar:
        "Military action threatening the world's most critical oil chokepoint, through which 20% of global oil flows.",
      insight:
        "Oil prices jumped 4% on each incident. Hormuz Strait threats create an immediate risk premium on crude but tend to fade within weeks if no sustained blockade materializes.",
      tags: ["iran", "hormuz", "strait", "oil", "tanker", "gulf", "middle east", "shipping", "blockade"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 4.1, week1Pct: 6.2 },
        { asset: "Brent Crude", direction: "up", day1Pct: 3.8, week1Pct: 5.9 },
        { asset: "Gold", direction: "up", day1Pct: 1.2, week1Pct: 2.3 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.6, week1Pct: -1.1 },
      ],
    },
    {
      description: "US-China trade war escalation: new tariffs on $200B of goods",
      year: 2019,
      whySimilar:
        "Escalating tariffs between the world's two largest economies disrupting global supply chains and trade flows.",
      insight:
        "S&P 500 dropped 5% in a week on tariff escalation fears. Trade wars hit exporters and tech hardest, while gold and treasuries rally as safe havens.",
      tags: ["china", "trade war", "tariff", "trade", "trump", "sanctions", "export", "supply chain"],
      reactions: [
        { asset: "S&P 500", direction: "down", day1Pct: -2.4, week1Pct: -5.1 },
        { asset: "Gold", direction: "up", day1Pct: 1.5, week1Pct: 3.8 },
        { asset: "Apple", direction: "down", day1Pct: -3.2, week1Pct: -6.4 },
      ],
    },
    {
      description: "Houthi rebels attack Red Sea shipping, disrupting global trade",
      year: 2024,
      whySimilar:
        "Armed group targeting commercial shipping in a critical maritime chokepoint, forcing vessels to reroute around Africa.",
      insight:
        "Shipping costs spiked 200% and oil rose 5% as Suez Canal traffic dropped 40%. Maritime disruptions create cascading supply chain effects that take months to normalize.",
      tags: ["houthi", "red sea", "shipping", "suez", "yemen", "maritime", "trade", "supply chain", "iran"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 3.5, week1Pct: 5.2 },
        { asset: "Gold", direction: "up", day1Pct: 0.8, week1Pct: 2.1 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.4, week1Pct: -0.9 },
      ],
    },
    {
      description: "Israel-Hamas war begins after October 7 attack",
      year: 2023,
      whySimilar:
        "Major military conflict in the Middle East raising fears of regional escalation involving Iran and disruption to energy flows.",
      insight:
        "Oil rose 4% on fears Iran could be drawn in. Markets initially sold off but recovered within two weeks as the conflict remained contained. Regional wars without direct oil supply disruption tend to have limited lasting market impact.",
      tags: ["israel", "hamas", "gaza", "war", "iran", "middle east", "conflict", "attack"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 4.2, week1Pct: 7.1 },
        { asset: "Gold", direction: "up", day1Pct: 3.1, week1Pct: 5.6 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.5, week1Pct: 0.4 },
      ],
    },
    {
      description: "China conducts military exercises around Taiwan after Pelosi visit",
      year: 2022,
      whySimilar:
        "Military escalation around Taiwan threatening the global semiconductor supply chain and raising US-China tension.",
      insight:
        "Chip stocks fell 3-5% on the exercises. Taiwan produces 65% of the world's semiconductors -- any threat to the island directly threatens the entire tech supply chain.",
      tags: ["china", "taiwan", "military", "pelosi", "semiconductor", "chip", "tension", "asia", "south china sea"],
      reactions: [
        { asset: "Nvidia", direction: "down", day1Pct: -3.2, week1Pct: -4.8 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.7, week1Pct: -1.3 },
        { asset: "Gold", direction: "up", day1Pct: 0.9, week1Pct: 1.8 },
      ],
    },
    {
      description: "Trump announces tariff pause on most countries, keeps China tariffs at 145%",
      year: 2025,
      whySimilar:
        "Sudden policy reversal on trade creating market whiplash, with selective escalation against China while de-escalating elsewhere.",
      insight:
        "S&P 500 surged 9.5% on the tariff pause day -- the third-largest single-day gain ever. Markets reward de-escalation dramatically but remain wary of targeted China decoupling.",
      tags: ["trump", "tariff", "trade", "china", "pause", "trade war", "policy"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 9.5, week1Pct: 5.3 },
        { asset: "Apple", direction: "up", day1Pct: 6.2, week1Pct: 3.1 },
        { asset: "Nvidia", direction: "up", day1Pct: 12.1, week1Pct: 7.4 },
      ],
    },
    {
      description: "Israel-Lebanon ceasefire agreement reached after months of border conflict",
      year: 2024,
      whySimilar:
        "Diplomatic resolution of an active Middle Eastern conflict, reducing regional war risk and easing energy supply fears.",
      insight:
        "Oil dropped 3% on the ceasefire as the risk premium unwound. Ceasefire agreements in the Middle East tend to lower oil prices quickly but the lasting effect depends on whether Iran-linked groups honor the deal.",
      tags: ["israel", "lebanon", "ceasefire", "talks", "diplomacy", "peace", "hezbollah", "iran", "middle east", "negotiate"],
      reactions: [
        { asset: "Oil", direction: "down", day1Pct: -2.8, week1Pct: -4.1 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.5, week1Pct: 1.2 },
        { asset: "Gold", direction: "down", day1Pct: -1.0, week1Pct: -2.3 },
      ],
    },
    {
      description: "Russia-Ukraine grain corridor deal mediated by Turkey eases food crisis",
      year: 2022,
      whySimilar:
        "Diplomatic deal to restore disrupted commodity flows, de-escalating a key economic consequence of the conflict.",
      insight:
        "Wheat dropped 6% on the deal and global food stocks rallied. Markets strongly reward conflict-related supply agreements, but gains can reverse if compliance breaks down.",
      tags: ["russia", "ukraine", "grain", "deal", "talks", "turkey", "diplomacy", "ceasefire", "negotiate", "peace", "food", "commodity"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 1.5 },
        { asset: "Gold", direction: "down", day1Pct: -0.7, week1Pct: -1.5 },
        { asset: "EUR/USD", direction: "up", day1Pct: 0.4, week1Pct: 0.9 },
      ],
    },
    {
      description: "Iran nuclear deal talks resume, raising hopes of sanctions relief",
      year: 2021,
      whySimilar:
        "Diplomatic engagement with Iran reducing geopolitical risk in the Middle East and potentially increasing oil supply if sanctions are eased.",
      insight:
        "Oil dipped 2% on hopes of increased Iranian supply. Whenever Iran diplomacy shows progress, oil markets price in additional barrels that could enter the market.",
      tags: ["iran", "nuclear", "talks", "diplomacy", "sanctions", "deal", "negotiate", "middle east", "oil", "peace"],
      reactions: [
        { asset: "Oil", direction: "down", day1Pct: -2.1, week1Pct: -3.5 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.3, week1Pct: 0.8 },
        { asset: "Gold", direction: "down", day1Pct: -0.5, week1Pct: -1.2 },
      ],
    },
    {
      description: "US kills Iranian General Soleimani in drone strike, oil spikes on retaliation fears",
      year: 2020,
      whySimilar:
        "Targeted killing of a senior Iranian military commander dramatically escalated US-Iran tensions and raised fears of a broader Middle East war.",
      insight:
        "Oil spiked 4% and gold surged as safe haven demand soared. The initial market shock was severe but faded within two weeks as Iran's retaliation proved measured. Iran confrontation headlines create sharp but often temporary risk-off moves.",
      tags: ["iran", "soleimani", "strike", "war", "middle east", "oil", "conflict", "retaliation", "military", "us-iran"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 3.5, week1Pct: -1.2 },
        { asset: "Gold", direction: "up", day1Pct: 2.3, week1Pct: 3.8 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.7, week1Pct: 0.9 },
      ],
    },
    {
      description: "Iran attacks oil tankers in Gulf of Oman, oil jumps on supply fears",
      year: 2019,
      whySimilar:
        "Attacks on commercial vessels near the Strait of Hormuz raised the risk of a broader conflict disrupting global oil supplies.",
      insight:
        "Oil jumped 4% but gains faded as no sustained disruption materialized. Iran-linked tanker incidents create a temporary risk premium that dissipates without escalation.",
      tags: ["iran", "tanker", "attack", "gulf", "oil", "hormuz", "middle east", "shipping", "conflict", "supply threat"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 3.9, week1Pct: 1.5 },
        { asset: "Gold", direction: "up", day1Pct: 1.1, week1Pct: 2.0 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.4, week1Pct: 0.3 },
      ],
    },
    {
      description: "Iranian Revolution triggers oil crisis, crude doubles in months",
      year: 1979,
      whySimilar:
        "Political upheaval in Iran caused a major oil supply disruption, with Iranian production collapsing and global prices doubling.",
      insight:
        "The 1979 oil shock proved that Iran's internal instability can have global commodity impact for years. Any threat to Iranian oil production — whether internal or external — triggers outsized market reactions due to this historical precedent.",
      tags: ["iran", "revolution", "oil crisis", "oil shock", "supply", "crude", "middle east", "opec", "energy crisis"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 8.0, week1Pct: 15.0 },
        { asset: "Gold", direction: "up", day1Pct: 5.0, week1Pct: 12.0 },
        { asset: "S&P 500", direction: "down", day1Pct: -2.5, week1Pct: -6.0 },
      ],
    },
  ],

  "interest-rates": [
    {
      description: "Fed raises rates by 75bps for the first time since 1994",
      year: 2022,
      whySimilar:
        "Aggressive rate hike to combat surging inflation, signaling a hawkish policy shift that surprised markets.",
      insight:
        "Tech stocks fell 5% in the week as higher rates directly compress growth stock valuations. The faster rates rise, the harder high-P/E stocks get hit.",
      tags: ["fed", "rate hike", "inflation", "hawkish", "powell", "75 basis points", "federal reserve"],
      reactions: [
        { asset: "S&P 500", direction: "down", day1Pct: -1.5, week1Pct: -5.2 },
        { asset: "Gold", direction: "down", day1Pct: -0.8, week1Pct: -2.3 },
        { asset: "Bitcoin", direction: "down", day1Pct: -7.5, week1Pct: -15.2 },
      ],
    },
    {
      description: "Fed cuts rates for the first time in 4 years, signals easing cycle",
      year: 2024,
      whySimilar:
        "Central bank pivoting from tightening to easing after inflation cools, marking a turning point for markets.",
      insight:
        "Stocks rallied 2% and gold hit all-time highs. The first rate cut after a tightening cycle historically starts a 12-month rally averaging 15% for the S&P 500.",
      tags: ["fed", "rate cut", "easing", "pivot", "powell", "inflation", "federal reserve", "monetary policy"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 1.7, week1Pct: 3.2 },
        { asset: "Gold", direction: "up", day1Pct: 1.3, week1Pct: 4.1 },
        { asset: "Bitcoin", direction: "up", day1Pct: 5.2, week1Pct: 8.8 },
      ],
    },
    {
      description: "ECB raises rates into positive territory for the first time in a decade",
      year: 2022,
      whySimilar:
        "European Central Bank ending negative rates in a historic shift, affecting Euro-zone equities and currency.",
      insight:
        "EUR/USD initially rose on the rate hike but then fell as recession fears dominated. Rate hikes into weakness can be counterproductive for currencies.",
      tags: ["ecb", "europe", "rate hike", "negative rates", "euro", "inflation", "central bank"],
      reactions: [
        { asset: "EUR/USD", direction: "up", day1Pct: 0.6, week1Pct: -1.2 },
        { asset: "DAX", direction: "down", day1Pct: -0.8, week1Pct: -2.4 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.3, week1Pct: -0.9 },
      ],
    },
    {
      description: "Bank of England emergency rate hike to 3% amid gilt market crisis",
      year: 2022,
      whySimilar:
        "Emergency monetary policy action triggered by a fiscal policy disaster (Truss mini-budget), forcing central bank intervention.",
      insight:
        "GBP/USD crashed 4% to an all-time low. When fiscal policy and monetary policy collide, currency markets take the hit first and hardest.",
      tags: ["bank of england", "uk", "gilt", "crisis", "truss", "pound", "emergency", "gbp"],
      reactions: [
        { asset: "GBP/USD", direction: "down", day1Pct: -3.6, week1Pct: -1.2 },
        { asset: "FTSE 100", direction: "down", day1Pct: -1.8, week1Pct: -3.1 },
        { asset: "Gold", direction: "up", day1Pct: 1.2, week1Pct: 2.8 },
      ],
    },
    {
      description: "Fed pauses rate hikes at 5.25-5.5%, holds for 11 months",
      year: 2023,
      whySimilar:
        "After aggressive tightening, the Fed held rates steady for an extended period while evaluating whether inflation would cool without further hikes.",
      insight:
        "S&P 500 rallied 26% during the pause period as markets anticipated the next move would be a cut. Long pauses historically signal the peak of the cycle.",
      tags: ["fed", "hold", "pause", "stay", "steady", "unchanged", "on hold", "wait", "patient", "no change", "federal reserve"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.6, week1Pct: 2.1 },
        { asset: "Gold", direction: "up", day1Pct: 0.4, week1Pct: 1.5 },
        { asset: "Bitcoin", direction: "up", day1Pct: 2.1, week1Pct: 5.3 },
      ],
    },
    {
      description: "Fed holds rates at near-zero for 2 years despite inflation signals",
      year: 2021,
      whySimilar:
        "Central bank maintained accommodative policy for longer than expected, fueling a debate about whether inflation would be transitory.",
      insight:
        "Keeping rates low for too long fueled asset bubbles. Growth stocks and crypto surged while value investors warned of an eventual reckoning.",
      tags: ["fed", "hold", "low", "transitory", "inflation", "near-zero", "accommodative", "stay", "steady", "federal reserve"],
      reactions: [
        { asset: "S&P 500", direction: "up", day1Pct: 0.3, week1Pct: 1.2 },
        { asset: "Bitcoin", direction: "up", day1Pct: 4.5, week1Pct: 12.3 },
        { asset: "Gold", direction: "down", day1Pct: -0.1, week1Pct: -0.3 },
      ],
    },
    {
      description: "BOJ introduces negative interest rates, shocking markets",
      year: 2016,
      whySimilar:
        "Bank of Japan adopted negative rates to fight deflation, a radical monetary policy experiment that sent shockwaves through currency and bond markets.",
      insight:
        "USD/JPY surged 2% on the day but reversed within weeks as markets questioned whether negative rates would work. BOJ policy surprises create sharp JPY moves but the follow-through is often limited.",
      tags: ["boj", "bank of japan", "negative rates", "japan", "yen", "jpy", "monetary policy", "deflation", "rate decision"],
      reactions: [
        { asset: "USD/JPY", direction: "up", day1Pct: 2.0, week1Pct: -1.5 },
        { asset: "Nikkei 225", direction: "up", day1Pct: 2.8, week1Pct: -3.1 },
        { asset: "Gold", direction: "up", day1Pct: 1.5, week1Pct: 4.2 },
      ],
    },
    {
      description: "BOJ adjusts yield curve control, allowing 10-year yields to rise to 1%",
      year: 2023,
      whySimilar:
        "Bank of Japan loosened its yield curve control policy, signaling a gradual exit from ultra-loose monetary policy after years of stimulus.",
      insight:
        "Japanese government bond yields spiked and the yen strengthened 2%. BOJ YCC adjustments are de facto rate changes — they signal the end of an era of free money in Japan and ripple through global bond markets.",
      tags: ["boj", "bank of japan", "ycc", "yield curve control", "japan", "yen", "jpy", "bond", "rate decision", "policy shift"],
      reactions: [
        { asset: "USD/JPY", direction: "down", day1Pct: -1.3, week1Pct: -2.8 },
        { asset: "Nikkei 225", direction: "down", day1Pct: -1.5, week1Pct: -2.1 },
        { asset: "Gold", direction: "up", day1Pct: 0.8, week1Pct: 1.9 },
      ],
    },
    {
      description: "BOJ raises rates for the first time in 17 years, ending negative rate era",
      year: 2024,
      whySimilar:
        "Bank of Japan ended its negative interest rate policy and yield curve control, marking the end of the world's last major ultra-loose monetary experiment.",
      insight:
        "The yen initially strengthened but then weakened as markets realized the hike was modest. The Nikkei rallied as the move was seen as confidence in Japan's economy. BOJ normalization is bullish for Japanese equities when gradual.",
      tags: ["boj", "bank of japan", "rate hike", "japan", "yen", "jpy", "negative rates", "normalization", "rate decision", "historic"],
      reactions: [
        { asset: "USD/JPY", direction: "up", day1Pct: 0.5, week1Pct: 1.2 },
        { asset: "Nikkei 225", direction: "up", day1Pct: 0.7, week1Pct: 2.3 },
        { asset: "Gold", direction: "up", day1Pct: 0.3, week1Pct: 1.1 },
      ],
    },
    {
      description: "Fed holds rates steady during Gulf War uncertainty, prioritizing stability",
      year: 1991,
      whySimilar:
        "Central bank chose to hold rates during a geopolitical crisis, balancing inflation risks against economic uncertainty from a military conflict.",
      insight:
        "Markets initially sold off on war fears but rallied sharply once the ground war proved swift. Central banks holding steady during conflicts signal they won't add monetary shock on top of geopolitical shock.",
      tags: ["fed", "hold", "steady", "war", "geopolitical", "gulf war", "conflict", "uncertainty", "rate decision", "federal reserve"],
      reactions: [
        { asset: "S&P 500", direction: "down", day1Pct: -1.0, week1Pct: 3.5 },
        { asset: "Oil", direction: "up", day1Pct: 5.2, week1Pct: -8.1 },
        { asset: "Gold", direction: "up", day1Pct: 1.8, week1Pct: -0.5 },
      ],
    },
    {
      description: "ECB holds rates despite Ukraine war inflation, prioritizing growth",
      year: 2022,
      whySimilar:
        "Central bank delayed tightening during an active military conflict near its borders, weighing inflation against the risk of a war-driven recession.",
      insight:
        "The euro weakened as the ECB fell behind the Fed on rate hikes. Central banks that hold during wars while peers tighten tend to see currency depreciation.",
      tags: ["ecb", "hold", "steady", "war", "ukraine", "geopolitical", "inflation", "conflict", "europe", "rate decision", "central bank"],
      reactions: [
        { asset: "EUR/USD", direction: "down", day1Pct: -0.8, week1Pct: -2.3 },
        { asset: "DAX", direction: "down", day1Pct: -1.5, week1Pct: -3.8 },
        { asset: "Gold", direction: "up", day1Pct: 1.0, week1Pct: 2.5 },
      ],
    },
  ],

  regulation: [
    {
      description: "EU passes landmark AI Act, the world's first comprehensive AI regulation",
      year: 2024,
      whySimilar:
        "Government imposing new regulatory framework on a fast-growing technology sector, creating compliance costs and market uncertainty.",
      insight:
        "European AI stocks dipped initially but recovered as the rules were seen as creating a level playing field. Regulation often hurts incumbents less than feared while raising barriers for new entrants.",
      tags: ["ai", "regulation", "europe", "eu", "compliance", "technology", "policy", "act"],
      reactions: [
        { asset: "S&P 500", direction: "down", day1Pct: -0.2, week1Pct: 0.5 },
        { asset: "Nvidia", direction: "down", day1Pct: -1.1, week1Pct: 0.8 },
      ],
    },
    {
      description: "US DOJ files antitrust suit against Google over search monopoly",
      year: 2023,
      whySimilar:
        "Government antitrust action against a dominant tech platform, threatening to break up or restrict its core business.",
      insight:
        "Alphabet dipped 2% but recovered quickly. Major antitrust cases take years to resolve and markets tend to discount the long-term threat after the initial shock.",
      tags: ["google", "antitrust", "doj", "monopoly", "search", "regulation", "tech", "lawsuit"],
      reactions: [
        { asset: "Alphabet (Google)", direction: "down", day1Pct: -2.1, week1Pct: -0.4 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.2, week1Pct: 0.3 },
      ],
    },
    {
      description: "SEC sues Coinbase and Binance, classifying most crypto as securities",
      year: 2023,
      whySimilar:
        "Regulatory crackdown on an entire asset class, creating existential risk for exchanges and tokens classified as securities.",
      insight:
        "Bitcoin dropped 5% and altcoins fell 10-20%. Crypto-specific regulation creates immediate sell-offs but Bitcoin tends to recover faster than smaller tokens.",
      tags: ["sec", "crypto", "bitcoin", "regulation", "coinbase", "binance", "securities"],
      reactions: [
        { asset: "Bitcoin", direction: "down", day1Pct: -5.3, week1Pct: -8.7 },
        { asset: "Ethereum", direction: "down", day1Pct: -7.1, week1Pct: -12.4 },
      ],
    },
    {
      description: "US bans TikTok unless ByteDance divests within 270 days",
      year: 2024,
      whySimilar:
        "National security-driven legislation forcing divestiture of a major tech platform, setting precedent for foreign-owned tech companies.",
      insight:
        "Meta and Snap rallied 3-7% on the ban as they stood to capture TikTok's ad revenue. Platform bans create clear winners among competitors.",
      tags: ["tiktok", "ban", "bytedance", "china", "social media", "national security", "legislation"],
      reactions: [
        { asset: "Meta", direction: "up", day1Pct: 3.2, week1Pct: 7.1 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.2, week1Pct: 0.6 },
      ],
    },
  ],

  lawsuits: [
    {
      description: "Epic Games wins partial antitrust victory against Apple's App Store",
      year: 2021,
      whySimilar:
        "Lawsuit challenging a tech platform's control over its marketplace, with implications for revenue share and developer economics.",
      insight:
        "Apple fell 3% on the ruling but recovered within days. Courts rarely deliver knockout blows to tech platforms -- most rulings result in incremental changes rather than structural breakups.",
      tags: ["apple", "epic", "antitrust", "app store", "lawsuit", "developer", "monopoly"],
      reactions: [
        { asset: "Apple", direction: "down", day1Pct: -3.3, week1Pct: -0.8 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.2, week1Pct: 0.4 },
      ],
    },
    {
      description: "Facebook settles Cambridge Analytica privacy lawsuit for $725M",
      year: 2022,
      whySimilar:
        "Major privacy violation settlement creating precedent for data handling liability and regulatory scrutiny.",
      insight:
        "Meta actually rose on the settlement as the $725M was seen as manageable and removed uncertainty. Markets often rally on settlements because they eliminate tail risk.",
      tags: ["facebook", "meta", "privacy", "data", "settlement", "cambridge", "fine"],
      reactions: [
        { asset: "Meta", direction: "up", day1Pct: 1.8, week1Pct: 4.2 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.1, week1Pct: 0.5 },
      ],
    },
    {
      description: "FTC sues to block Microsoft's $69B Activision acquisition",
      year: 2022,
      whySimilar:
        "Regulatory body attempting to block a major tech acquisition on antitrust grounds, creating deal uncertainty.",
      insight:
        "Activision stock dropped on FTC filing but surged when the deal eventually cleared. M&A lawsuits create arbitrage opportunities -- if the deal fundamentals are strong, the spread often narrows.",
      tags: ["microsoft", "activision", "ftc", "acquisition", "merger", "antitrust", "gaming"],
      reactions: [
        { asset: "Microsoft", direction: "down", day1Pct: -2.1, week1Pct: -1.3 },
        { asset: "S&P 500", direction: "down", day1Pct: -0.3, week1Pct: -0.5 },
      ],
    },
    {
      description: "Volkswagen faces $30B+ in diesel emissions scandal fines",
      year: 2015,
      whySimilar:
        "Corporate fraud exposed, leading to massive fines, criminal charges, and a fundamental loss of investor trust.",
      insight:
        "VW stock crashed 35% in a week. Fraud or deception scandals create the steepest sell-offs because they destroy trust, which takes years to rebuild.",
      tags: ["volkswagen", "diesel", "emissions", "fraud", "scandal", "fine", "germany", "auto"],
      reactions: [
        { asset: "Volkswagen", direction: "down", day1Pct: -17.1, week1Pct: -35.2 },
        { asset: "DAX", direction: "down", day1Pct: -2.3, week1Pct: -4.1 },
      ],
    },
  ],

  "commodity-shocks": [
    {
      description: "Oil prices go negative for the first time in history (-$37/barrel)",
      year: 2020,
      whySimilar:
        "Extreme demand collapse combined with storage overflow causing unprecedented commodity price dislocation.",
      insight:
        "The negative print was a storage/logistics anomaly, not a true price signal. Oil recovered to $30 within a month. Extreme commodity dislocations tend to mean-revert rapidly once the physical constraint resolves.",
      tags: ["oil", "negative", "price crash", "demand", "storage", "covid", "pandemic", "crude"],
      reactions: [
        { asset: "Oil", direction: "down", day1Pct: -43.0, week1Pct: 19.0 },
        { asset: "ExxonMobil", direction: "down", day1Pct: -4.7, week1Pct: 8.2 },
        { asset: "S&P 500", direction: "down", day1Pct: -1.8, week1Pct: 3.5 },
      ],
    },
    {
      description: "OPEC+ announces surprise 1.16M barrel/day production cut",
      year: 2023,
      whySimilar:
        "Coordinated supply restriction by major oil producers to prop up prices amid demand uncertainty.",
      insight:
        "Oil jumped 6% immediately. OPEC surprise cuts create sharp one-day moves, but the longer-term impact depends on whether demand can absorb the higher prices.",
      tags: ["opec", "oil", "production cut", "supply", "saudi", "crude", "brent", "barrel"],
      reactions: [
        { asset: "Oil", direction: "up", day1Pct: 6.3, week1Pct: 4.1 },
        { asset: "Brent Crude", direction: "up", day1Pct: 5.8, week1Pct: 3.9 },
        { asset: "ExxonMobil", direction: "up", day1Pct: 4.2, week1Pct: 3.1 },
      ],
    },
    {
      description: "European natural gas prices spike 10x as Russia cuts Nord Stream supply",
      year: 2022,
      whySimilar:
        "Weaponization of energy supply creating an existential energy crisis for an entire continent.",
      insight:
        "European industrial stocks crashed while US LNG exporters surged. Energy supply weaponization creates massive regional winners and losers rather than a uniform global effect.",
      tags: ["natural gas", "russia", "nord stream", "pipeline", "europe", "energy crisis", "supply"],
      reactions: [
        { asset: "Natural Gas", direction: "up", day1Pct: 12.3, week1Pct: 28.1 },
        { asset: "DAX", direction: "down", day1Pct: -2.8, week1Pct: -6.3 },
        { asset: "EUR/USD", direction: "down", day1Pct: -1.1, week1Pct: -3.2 },
      ],
    },
    {
      description: "Gold hits all-time high above $2,400 on central bank buying spree",
      year: 2024,
      whySimilar:
        "Sustained buying by central banks (especially China) driving gold to record levels amid de-dollarization fears.",
      insight:
        "Gold rallied 15% in Q1 2024. When central banks are net buyers, gold tends to find a higher floor. The move reflected structural demand rather than speculative fever.",
      tags: ["gold", "central bank", "china", "de-dollarization", "record", "commodity", "safe haven"],
      reactions: [
        { asset: "Gold", direction: "up", day1Pct: 1.8, week1Pct: 4.5 },
        { asset: "S&P 500", direction: "up", day1Pct: 0.3, week1Pct: 1.1 },
        { asset: "Bitcoin", direction: "up", day1Pct: 3.2, week1Pct: 7.8 },
      ],
    },
  ],
};

const MATCH_STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "is","are","was","were","be","been","has","had","have","its","it",
  "this","that","from","by","as","not","no","up","out","into","over",
  "says","said","new","also","more","after","before","first","most",
  "while","will","would","could","should","may","about","than",
]);

const GENERIC_TAGS = new Set([
  "war", "conflict", "oil", "inflation", "rates", "rate", "hold",
  "steady", "policy", "central bank", "middle east", "supply",
  "crisis", "demand", "market", "stocks", "economy",
]);

function extractWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !MATCH_STOP_WORDS.has(w))
  );
}

function tagSpecificity(tag: string): number {
  if (GENERIC_TAGS.has(tag)) return 1;
  if (tag.split(/\s+/).length >= 2) return 4;
  return 2;
}

function computeRelevance(
  eventText: string,
  entry: HistoricalEntry
): number {
  const lowerText = eventText.toLowerCase();
  const eventWords = extractWords(eventText);
  const entryText = `${entry.description} ${entry.whySimilar}`;
  const entryWords = extractWords(entryText);

  let score = 0;
  let tagMatchCount = 0;

  for (const tag of entry.tags) {
    const lowerTag = tag.toLowerCase();
    if (lowerText.includes(lowerTag)) {
      const specificity = tagSpecificity(lowerTag);
      score += specificity;
      tagMatchCount++;
    }
  }

  let overlap = 0;
  for (const w of eventWords) {
    if (entryWords.has(w) && !GENERIC_TAGS.has(w)) overlap++;
  }
  score += Math.min(overlap, 4);

  if (tagMatchCount < 2 && score < 6) return 0;

  return score;
}

export function findHistoricalMatches(
  title: string,
  type: EventType,
  summary: string
): HistoricalMatch[] {
  const allTypes = [type, ...Object.keys(DB).filter((t) => t !== type)] as EventType[];
  const text = `${title} ${summary}`;

  const candidates: { entry: HistoricalEntry; score: number }[] = [];

  for (const t of allTypes) {
    const entries = DB[t];
    if (!entries) continue;
    for (const entry of entries) {
      const relevance = computeRelevance(text, entry);
      if (relevance === 0) continue;
      const typeBonus = t === type ? 4 : 0;
      candidates.push({ entry, score: relevance + typeBonus });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  const MIN_SCORE = 8;
  const good = candidates.filter((c) => c.score >= MIN_SCORE);

  if (good.length === 0) return [];

  const result: HistoricalEntry[] = [];
  const usedDescPrefixes = new Set<string>();

  for (const c of good) {
    if (result.length >= 3) break;
    const prefix = c.entry.description.slice(0, 40);
    if (usedDescPrefixes.has(prefix)) continue;
    result.push(c.entry);
    usedDescPrefixes.add(prefix);
  }

  return result.map((entry) => ({
    description: entry.description,
    year: entry.year,
    whySimilar: entry.whySimilar,
    insight: entry.insight,
    reactions: entry.reactions,
  }));
}

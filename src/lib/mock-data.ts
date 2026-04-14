import { MarketEvent, MarketEventSummary } from "./types";

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const MOCK_EVENTS: MarketEvent[] = [
  {
    id: "evt-001",
    title: "Fed Holds Rates Steady, Signals Cuts Later This Year",
    type: "interest-rates",
    date: getDateString(0),
    summary:
      "The Federal Reserve kept its benchmark interest rate unchanged at 4.25-4.50% but signaled it expects to cut rates twice before year-end, citing cooling inflation and a softening labor market.",
    imageUrl: null,
    source: "Reuters",
    scope: "global",
    historicalMatches: [
      {
        description:
          "Fed pauses rate hikes after 10 consecutive increases, signals potential cuts",
        year: 2006,
        whySimilar:
          "Both events mark the end of a tightening cycle with forward guidance suggesting easing ahead. The 2006 pause came after rates hit 5.25%, similar macro uncertainty.",
        insight:
          "After the 2006 pause, the S&P 500 rallied 4.2% over the following month as markets priced in the pivot.",
        reactions: [
          { asset: "S&P 500", direction: "up", day1Pct: 1.1, week1Pct: 2.3 },
          {
            asset: "10Y Treasury",
            direction: "down",
            day1Pct: -0.8,
            week1Pct: -1.5,
          },
          {
            asset: "USD Index",
            direction: "down",
            day1Pct: -0.4,
            week1Pct: -1.2,
          },
        ],
      },
      {
        description:
          "Fed signals rate cuts amid trade war concerns and slowing global growth",
        year: 2019,
        whySimilar:
          "Similar dovish pivot in response to economic uncertainty. In 2019, the Fed shifted from hiking to cutting within months, driven by trade tensions.",
        insight:
          "The 2019 pivot led to three rate cuts and a 10% equity rally in H2 2019.",
        reactions: [
          { asset: "S&P 500", direction: "up", day1Pct: 0.8, week1Pct: 1.9 },
          {
            asset: "Gold",
            direction: "up",
            day1Pct: 1.2,
            week1Pct: 2.8,
          },
        ],
      },
    ],
  },
  {
    id: "evt-002",
    title: "Tesla Reports Record Q1 Deliveries, Beats Wall Street Estimates",
    type: "earnings",
    date: getDateString(1),
    summary:
      "Tesla delivered 495,000 vehicles in Q1 2026, surpassing analyst estimates of 470,000. Revenue came in at $27.3 billion, driven by strong demand for the refreshed Model Y and new Model Q.",
    imageUrl: null,
    source: "Bloomberg",
    scope: "global",
    historicalMatches: [
      {
        description:
          "Tesla reports first profitable year with record Q4 2020 deliveries",
        year: 2021,
        whySimilar:
          "Both events show Tesla beating delivery expectations at a turning point. The 2021 report confirmed Tesla's path to sustained profitability.",
        insight:
          "Tesla stock rose 8% in the week following the Q4 2020 earnings beat, as S&P 500 inclusion amplified buying pressure.",
        reactions: [
          { asset: "TSLA", direction: "up", day1Pct: 3.2, week1Pct: 7.8 },
          {
            asset: "ARKK ETF",
            direction: "up",
            day1Pct: 2.1,
            week1Pct: 5.4,
          },
        ],
      },
    ],
  },
  {
    id: "evt-003",
    title: "EU Passes Sweeping AI Regulation With Strict Compliance Deadlines",
    type: "regulation",
    date: getDateString(2),
    summary:
      "The European Parliament approved the AI Act's implementation framework, requiring all high-risk AI systems to meet compliance standards by Q1 2027. Companies face fines up to 7% of global revenue for violations.",
    imageUrl: null,
    source: "Financial Times",
    scope: "global",
    historicalMatches: [
      {
        description: "GDPR enforcement begins, reshaping tech data practices",
        year: 2018,
        whySimilar:
          "Both are landmark EU regulations targeting tech companies with significant compliance costs and global spillover effects. GDPR set the precedent for Brussels as a global tech regulator.",
        insight:
          "European tech stocks dipped initially after GDPR but recovered within two weeks as compliance fears proved overblown for large-cap names.",
        reactions: [
          {
            asset: "STOXX 600 Tech",
            direction: "down",
            day1Pct: -1.4,
            week1Pct: -0.3,
          },
          {
            asset: "Meta (Facebook)",
            direction: "down",
            day1Pct: -2.1,
            week1Pct: -3.5,
          },
          {
            asset: "Microsoft",
            direction: "up",
            day1Pct: 0.5,
            week1Pct: 1.2,
          },
        ],
      },
    ],
  },
  {
    id: "evt-004",
    title: "BP Announces 4,000 Job Cuts in Pivot Away From Renewables",
    type: "layoffs",
    date: getDateString(3),
    summary:
      "BP confirmed plans to cut 4,000 jobs globally as it scales back renewable energy investments and refocuses on core oil and gas operations, reversing its 2020 green energy strategy.",
    imageUrl: null,
    source: "The Guardian",
    scope: "global",
    historicalMatches: [
      {
        description:
          "Shell exits multiple renewable projects and cuts 9,000 jobs in restructuring",
        year: 2020,
        whySimilar:
          "Both are major oil companies restructuring with significant layoffs during strategic pivots. Shell's 2020 cuts came amid COVID-driven demand collapse.",
        insight:
          "Shell's stock rose 3% in the week after announcing cuts, as investors viewed the restructuring as positive for margins.",
        reactions: [
          { asset: "BP", direction: "up", day1Pct: 1.8, week1Pct: 3.1 },
          {
            asset: "Brent Crude",
            direction: "up",
            day1Pct: 0.6,
            week1Pct: 1.4,
          },
          {
            asset: "iShares Clean Energy ETF",
            direction: "down",
            day1Pct: -2.3,
            week1Pct: -4.1,
          },
        ],
      },
      {
        description:
          "GE announces 12,000 layoffs in power division restructuring",
        year: 2017,
        whySimilar:
          "Large-scale industrial layoffs signaling strategic retreat from a growth segment. GE's power cuts similarly marked abandonment of a major bet.",
        insight:
          "GE stock initially fell but stabilized within a week as the market digested the cost savings.",
        reactions: [
          { asset: "GE", direction: "down", day1Pct: -1.2, week1Pct: -0.5 },
        ],
      },
    ],
  },
  {
    id: "evt-005",
    title: "China Imposes Export Controls on Rare Earth Minerals",
    type: "geopolitical",
    date: getDateString(4),
    summary:
      "Beijing announced immediate export restrictions on seven critical rare earth elements used in EV batteries and defense systems, escalating trade tensions with the US and EU.",
    imageUrl: null,
    source: "South China Morning Post",
    scope: "global",
    historicalMatches: [
      {
        description:
          "China restricts rare earth exports to Japan during territorial dispute",
        year: 2010,
        whySimilar:
          "Both events involve China weaponizing rare earth supply chains for geopolitical leverage. The 2010 embargo targeted Japan over the Senkaku Islands dispute.",
        insight:
          "Rare earth prices surged 300% in the months following the 2010 restrictions, benefiting alternative mining companies.",
        reactions: [
          {
            asset: "Lynas Rare Earths",
            direction: "up",
            day1Pct: 8.5,
            week1Pct: 22.3,
          },
          {
            asset: "Toyota Motor",
            direction: "down",
            day1Pct: -3.1,
            week1Pct: -5.7,
          },
          {
            asset: "USD/CNY",
            direction: "up",
            day1Pct: 0.3,
            week1Pct: 0.8,
          },
        ],
      },
    ],
  },
  {
    id: "evt-006",
    title:
      "Deutsche Bank Faces $2.1B Lawsuit Over Mortgage-Backed Securities",
    type: "lawsuits",
    date: getDateString(5),
    summary:
      "A group of institutional investors filed a $2.1 billion lawsuit against Deutsche Bank, alleging the bank misrepresented the quality of mortgage-backed securities sold between 2020 and 2023.",
    imageUrl: null,
    source: "Handelsblatt",
    scope: "local",
    historicalMatches: [
      {
        description:
          "Deutsche Bank agrees to $7.2B settlement with DOJ over MBS fraud",
        year: 2017,
        whySimilar:
          "Same bank, same asset class, same type of allegation. The 2017 DOJ settlement was part of a wave of post-GFC enforcement actions against major banks.",
        insight:
          "Deutsche Bank stock dropped 6% on the initial DOJ demand but recovered most losses after the settlement was announced at a lower figure.",
        reactions: [
          {
            asset: "Deutsche Bank",
            direction: "down",
            day1Pct: -3.4,
            week1Pct: -5.2,
          },
          {
            asset: "Euro STOXX Banks",
            direction: "down",
            day1Pct: -1.1,
            week1Pct: -2.0,
          },
        ],
      },
    ],
  },
  {
    id: "evt-007",
    title: "Brent Crude Surges Past $95 on OPEC+ Production Cut Extension",
    type: "commodity-shocks",
    date: getDateString(6),
    summary:
      "OPEC+ agreed to extend voluntary production cuts of 2.2 million barrels per day through Q3 2026, pushing Brent crude above $95 for the first time since October 2023.",
    imageUrl: null,
    source: "CNBC",
    scope: "global",
    historicalMatches: [
      {
        description:
          "OPEC agrees to historic production cut of 1.2M barrels per day",
        year: 2016,
        whySimilar:
          "Both are major OPEC production cut agreements that significantly tightened supply. The 2016 deal ended a two-year price war and marked OPEC's first cut since 2008.",
        insight:
          "Oil prices rallied 15% in the month following the 2016 OPEC deal, with energy stocks outperforming the broader market.",
        reactions: [
          {
            asset: "Brent Crude",
            direction: "up",
            day1Pct: 4.5,
            week1Pct: 8.2,
          },
          {
            asset: "ExxonMobil",
            direction: "up",
            day1Pct: 2.8,
            week1Pct: 5.6,
          },
          {
            asset: "Airlines ETF (JETS)",
            direction: "down",
            day1Pct: -1.9,
            week1Pct: -3.4,
          },
        ],
      },
      {
        description:
          "Saudi Arabia launches oil price war, crude crashes 30% in one day",
        year: 2020,
        whySimilar:
          "Opposite outcome from the same dynamic — OPEC+ supply management. The 2020 price war happened when negotiations broke down, showing what happens without agreement.",
        insight:
          "The 2020 crash demonstrated how dependent oil markets are on OPEC+ coordination, making future agreements more impactful.",
        reactions: [
          {
            asset: "Brent Crude",
            direction: "down",
            day1Pct: -24.1,
            week1Pct: -19.8,
          },
          {
            asset: "S&P 500 Energy",
            direction: "down",
            day1Pct: -18.2,
            week1Pct: -15.3,
          },
        ],
      },
    ],
  },
];

export function getMockEvents(): MarketEventSummary[] {
  return MOCK_EVENTS.map(({ id, title, type, date, imageUrl, source }) => ({
    id,
    title,
    type,
    date,
    imageUrl,
    source,
  }));
}

export function getMockEventById(id: string): MarketEvent | undefined {
  return MOCK_EVENTS.find((e) => e.id === id);
}

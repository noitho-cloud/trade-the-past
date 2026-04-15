import { describe, it, expect } from "vitest";
import {
  classifyArticle,
  scoreEvent,
  classifyAndRank,
  cleanDescription,
} from "../event-classifier";
import type { RawArticle } from "../news-client";

function makeArticle(overrides: Partial<RawArticle> = {}): RawArticle {
  return {
    title: "Test headline",
    description: "Test description",
    url: "https://example.com/test-article",
    source: { id: "reuters", name: "Reuters" },
    publishedAt: new Date().toISOString(),
    urlToImage: null,
    ...overrides,
  };
}

describe("cleanDescription", () => {
  it("returns title for Google News articles instead of concatenated description", () => {
    const garbled =
      "Citigroup beats estimates, boosted by gains in fixed income CNBCEarnings live updates Yahoo FinanceCitigroup Profit Jumps 42% Barron's";
    const title = "Citigroup beats estimates, boosted by gains in fixed income";
    expect(cleanDescription(garbled, "Google News", title)).toBe(title);
  });

  it("returns title for Google News regional variants", () => {
    const desc = "Some garbled multi-source text";
    const title = "Clean headline";
    expect(cleanDescription(desc, "Google News UK", title)).toBe(title);
    expect(cleanDescription(desc, "Google News Business", title)).toBe(title);
  });

  it("returns description as-is for non-Google-News articles", () => {
    const desc = "A clean, readable summary from Reuters.";
    const title = "Reuters headline";
    expect(cleanDescription(desc, "Reuters", title)).toBe(desc);
  });

  it("returns title when description is null", () => {
    const title = "Fallback headline";
    expect(cleanDescription(null, "Reuters", title)).toBe(title);
  });

  it("returns title when description is empty string", () => {
    const title = "Fallback headline";
    expect(cleanDescription("", "Reuters", title)).toBe(title);
    expect(cleanDescription("   ", "Reuters", title)).toBe(title);
  });
});

describe("classifyArticle", () => {
  it("classifies Hormuz Strait blockade as geopolitical", () => {
    const article = makeArticle({
      title:
        "Trump threatens to close Strait of Hormuz, blocking major oil trade route",
      description:
        "US president announces naval blockade of the Strait of Hormuz, threatening 20% of global oil supply.",
    });
    const result = classifyArticle(article);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("geopolitical");
  });

  it("classifies naval military operations as geopolitical", () => {
    const article = makeArticle({
      title: "US deploys carrier fleet to Persian Gulf amid rising tensions",
      description:
        "Military deployment signals potential naval confrontation in the Gulf region.",
    });
    const result = classifyArticle(article);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("geopolitical");
  });

  it("classifies Suez Canal disruption as geopolitical", () => {
    const article = makeArticle({
      title:
        "Suez Canal blocked by military conflict, disrupting global shipping",
      description:
        "Missile attacks force closure of key maritime shipping route.",
    });
    const result = classifyArticle(article);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("geopolitical");
  });

  it("classifies oil supply disruption as commodity-shocks", () => {
    const article = makeArticle({
      title: "Oil supply shock as refinery output drops after pipeline attack",
      description:
        "Crude oil prices surge on supply disruption fears after major pipeline damage.",
    });
    const result = classifyArticle(article);
    expect(result).not.toBeNull();
    expect(result!.type).toBe("commodity-shocks");
  });

  it("gives geopolitical events higher confidence than routine interest rate holds", () => {
    const geoArticle = makeArticle({
      title:
        "Military troops enforce naval blockade amid sanctions and missile escalation",
      description:
        "NATO forces deploy as retaliation threats grow, raising fears of a wider geopolitical conflict.",
    });

    const rateArticle = makeArticle({
      title: "Fed holds rates steady at current levels",
      description:
        "The Federal Reserve kept interest rates unchanged, as expected.",
    });

    const geoResult = classifyArticle(geoArticle);
    const rateResult = classifyArticle(rateArticle);

    expect(geoResult).not.toBeNull();
    expect(rateResult).not.toBeNull();
    expect(geoResult!.confidence).toBeGreaterThan(rateResult!.confidence);
  });
});

describe("scoreEvent", () => {
  it("scores geopolitical events from high-authority sources very high", () => {
    const article = makeArticle({
      title: "NATO naval blockade of Strait of Hormuz triggers sanctions and missile threats",
      description: "Military troops deploy as geopolitical escalation and retaliation fears mount.",
      source: { id: "reuters", name: "Reuters" },
      publishedAt: new Date().toISOString(),
    });

    const result = classifyArticle(article);
    expect(result).not.toBeNull();
    const score = scoreEvent(article, result!.confidence);
    expect(score).toBeGreaterThan(5);
  });
});

describe("classifyAndRank", () => {
  it("ranks geopolitical crisis above routine earnings when both are recent", () => {
    const now = new Date().toISOString();
    const articles: RawArticle[] = [
      makeArticle({
        title: "Company X reports quarterly earnings in line with estimates",
        description: "Revenue meets expectations. Guidance unchanged.",
        source: { id: "bloomberg", name: "Bloomberg" },
        publishedAt: now,
      }),
      makeArticle({
        title:
          "Hormuz Strait blockade threatens global oil supply as military tensions escalate",
        description:
          "Naval conflict and shipping route closure spark energy crisis fears.",
        source: { id: "reuters", name: "Reuters" },
        publishedAt: now,
      }),
    ];

    const ranked = classifyAndRank(articles);
    expect(ranked.length).toBeGreaterThanOrEqual(1);
    expect(ranked[0].type).toBe("geopolitical");
  });
});

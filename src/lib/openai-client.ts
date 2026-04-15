import type { HistoricalMatch, EventType } from "./types";
import { buildHistoricalMatchPrompt } from "./historical-prompt";

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface RawMatchResponse {
  matches: Array<{
    description: string;
    year: number;
    whySimilar: string;
    insight: string;
    reactions: Array<{
      asset: string;
      direction: string;
      day1Pct: number;
      week1Pct: number;
    }>;
  }>;
}

export async function fetchHistoricalMatches(
  title: string,
  type: EventType,
  summary: string,
  source: string,
  apiKey: string
): Promise<HistoricalMatch[]> {
  const { system, user } = buildHistoricalMatchPrompt(
    title,
    type,
    summary,
    source
  );

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data: OpenAIChatResponse = await res.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return parseMatchResponse(content);
}

function parseMatchResponse(raw: string): HistoricalMatch[] {
  const parsed: RawMatchResponse = JSON.parse(raw);

  if (!parsed.matches || !Array.isArray(parsed.matches)) {
    throw new Error("Invalid response structure");
  }

  return parsed.matches.slice(0, 3).map((m) => ({
    description: String(m.description || ""),
    year: Number(m.year) || 2000,
    whySimilar: String(m.whySimilar || ""),
    insight: String(m.insight || ""),
    reactions: (m.reactions || []).map((r) => ({
      asset: String(r.asset || ""),
      direction: r.direction === "down" ? ("down" as const) : ("up" as const),
      day1Pct: Number(r.day1Pct) || 0,
      week1Pct: Number(r.week1Pct) || 0,
    })),
  }));
}

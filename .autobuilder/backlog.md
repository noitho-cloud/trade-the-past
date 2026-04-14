## Feedback (HIGHEST PRIORITY)

### 1. Real data — replace all mock data with live news and LLM matching
- Sign up for a free news API (NewsAPI or GNews) and add the key to .env
- Sign up for OpenAI API and add the key to .env
- Make the weekly view fetch REAL headlines from the news API, not mock data
- Make historical matching use the REAL LLM call (OpenAI GPT-4o-mini) instead of returning hardcoded matches
- The app must show actual current events — the mock data must be a fallback only, not the default
- This is the #1 priority — nothing else matters if the data isn't real

### 2. Event Detail Page — Combine historical matches into one insight
- Do NOT show 2 separate historical events as individual sections
- Synthesize all historical matches into ONE unified insight block
- One narrative: "Here's what happened in the past when similar events occurred"
- One consolidated market reaction table
- One clear takeaway, not multiple cards to compare

### 3. Event Detail Page — Show affected assets prominently
- After the insight, show a clear "Affected Assets" section
- List specific assets (stocks, indices, commodities, currencies) affected
- Each asset: name, direction hint from history, historical performance data
- CTAs ("Trade now", "Add to watchlist") tied to specific assets, not generic

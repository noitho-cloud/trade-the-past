# URGENT — Historical Matching Quality

## Problem
Historical matches are not relevant to the actual news event. Example:
- Event: "Bank of Japan keeps policy rate steady while raising inflation forecast on Iran war worries"
- Match 1: EU AI Act (2024) — COMPLETELY UNRELATED
- Match 2: Fed holds rates near-zero (2021) — loosely related but wrong context
- Match 3: Israel-Hamas war (2023) — different geography and impact

The unified insight mashes these together into nonsense.

## Root Cause
The keyword-based matching in `historical-db.ts` is too broad. It matches on individual words like "war" or "rates" instead of understanding the EVENT TYPE + CONTEXT combination.

## Required Fix
1. **Better matching logic**: Match on EVENT TYPE + CONTEXT together, not individual keywords
   - "BOJ rate hold + Iran war worries" should match → "BOJ rate decisions during geopolitical crises" or "Central bank holds during Middle East conflicts"
   - NOT random regulation events or unrelated wars
2. **Add more specific historical entries** to the database:
   - BOJ rate decisions (2016 negative rates, 2023 YCC adjustment, 2024 first hike in 17 years)
   - Central bank decisions during wars/conflicts
   - Iran-specific market events (2020 Soleimani, 2019 tanker attacks, 1979 revolution oil shock)
3. **Improve matching scoring**: Require multiple keyword matches, not just one. Weight matches by how specific the keyword is (e.g., "BOJ" is very specific, "rates" is generic)
4. **Quality gate**: Don't show a match if the match score is below a meaningful threshold — better to show fewer high-quality matches than 3 irrelevant ones
5. **Unified insight**: Only combine matches that are actually related. If matches are from different categories, present them separately or drop the weakest one.

## Priority
CRITICAL — this is the core value proposition of the app. If the historical matches are random, the app is useless.

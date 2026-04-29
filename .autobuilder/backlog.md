# URGENT — Events with zero historical matches

## Problem
Two events currently show "No historical parallels found":
1. "BOJ keeps interest rates steady, lifts inflation forecast" — The DB has BOJ entries (negative rates 2016, YCC adjustment 2023, rate hike 2024) but the matcher is NOT finding them. The matching logic is likely failing because the article keywords don't overlap enough with the DB tags.
2. "Turkish central bank keeps key policy rate unchanged again" — No entries exist for Turkey/emerging market central banks at all.

## Required Fixes

### Fix 1: Debug and fix the BOJ matching
The DB already has 3 BOJ entries with tags like "boj", "bank of japan", "rate decision", "japan". But "BOJ keeps interest rates steady" is not matching. Likely causes:
- The article title/summary doesn't contain "boj" literally — it says "Bank of Japan" or just "Japan"
- The matcher may be case-sensitive or requiring too many tag overlaps
- FIX: Make the matcher extract keywords from the title more aggressively. "Bank of Japan" should match "boj" and "bank of japan". "keeps interest rates steady" should match "rate decision", "hold", "steady".

### Fix 2: Add emerging market central bank entries
Add historical entries for:
- **Turkey 2023** — CBRT raises rates from 8.5% to 45% in aggressive hiking cycle after Erdogan reversal. Tags: turkey, turkish, cbrt, rate hike, emerging market, lira, inflation
- **Turkey 2021** — Erdogan fires central bank governor for raising rates, lira crashes 15%. Tags: turkey, turkish, cbrt, rate, governor fired, lira, political interference
- **Argentina 2023** — Central bank raises rates to 133% to fight 140% inflation. Tags: argentina, emerging market, hyperinflation, rate hike, peso
- **Brazil 2022** — BCB raises Selic rate to 13.75%, one of the most aggressive hiking cycles. Tags: brazil, selic, rate hike, emerging market, inflation

### Fix 3: Ensure NO event ever shows zero matches
Add a fallback: if the specific matcher finds 0 results, broaden the search to match by event TYPE only (e.g., any "interest-rates" historical entry). Better to show a loosely related historical parallel than nothing at all.

## Priority
CRITICAL — "No historical parallels found" is never acceptable. Every event must show at least one match.

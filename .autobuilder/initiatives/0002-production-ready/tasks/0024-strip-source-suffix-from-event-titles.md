---
id: trade-the-past-strip-source-suffix-from-event-titles
title: "Strip trailing source attribution from Google News event titles"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem statement

Every event title fetched from Google News RSS includes a trailing source attribution suffix like " - PBS", " - CBS News", " - The Washington Post". This suffix is redundant because the source is already displayed separately in the UI (as a "Google News" badge on the weekly card and on the event detail page). The duplicated source name clutters headlines and wastes screen real estate, especially on mobile where space is tight.

Examples observed in the live app:
- "WATCH LIVE: Fed Chair Powell holds briefing on interest rate decision as his term nears end - PBS"
- "Live Updates: Iran war and Strait of Hormuz stuck in limbo as Trump mulls latest Iranian offer - CBS News"
- "UAE to leave OPEC amid Hormuz oil crisis, a blow to Saudi Arabia - The Washington Post"

## User story

As a trader scanning the weekly view, I want clean, concise headlines without redundant source names, so that I can quickly understand each event without visual noise.

## How it was found

Surface sweep of the live app at http://localhost:3050. All 10 events in the API response (`/api/events`) have titles ending with " - <SourceName>" while the source is already shown separately via the `source` field.

## Proposed UX

- Strip the trailing " - SourceName" pattern from event titles before they reach the client
- Keep the separate source badge/label as-is (it already works correctly)
- Do the stripping in the RSS ingestion/classification layer so it benefits both weekly view and event detail pages
- Only strip known Google News RSS patterns (` - <1-4 word publisher name>` at end of title)

## Acceptance criteria

- [ ] Event titles no longer include trailing " - PublisherName" when sourced from Google News RSS
- [ ] Source badge continues to display correctly on weekly cards and event detail pages
- [ ] Existing tests pass
- [ ] No regression in event classification or historical matching

## Verification

- Run `npm test` — all tests pass
- Check `/api/events` response — titles should not end with " - <Source>"
- Browse the weekly view — headlines should be cleaner

## Out of scope

- Changing the source badge display
- Stripping any other parts of titles (e.g., "WATCH LIVE:" prefixes)
- Modifying historical data titles

---

## Planning

### Overview

Add a `stripSourceSuffix` function to the RSS client that removes the trailing " - PublisherName" pattern from Google News RSS titles. Google News RSS consistently appends " - <Source>" to every item title. Since the source is already captured in the `feedSource` parameter, this suffix is purely redundant.

### Research notes

- Google News RSS format consistently appends " - <Publisher Name>" to every title
- The pattern is always ` - <words>` at the end (1-5 words typically)
- Non-Google-News feeds (Yahoo Finance, CNBC, BBC, Reuters, Al Jazeera) do NOT append this suffix
- The `rssItemToArticle` function in `src/lib/rss-client.ts` is the ideal place to strip — it already receives `feedSource` and can conditionally apply the strip only for Google News feeds
- Stripping should happen BEFORE classification so keyword matching isn't affected by publisher names

### Architecture diagram

```mermaid
graph TD
    RSS[Google News RSS Feed] -->|title: "Event - PBS"| Parse[parseXML]
    Parse --> ItemToArticle[rssItemToArticle]
    ItemToArticle -->|feedSource starts with 'Google News'| Strip[stripSourceSuffix]
    Strip -->|title: "Event"| Article[RawArticle]
    Article --> Classify[classifyAndRank]
    Classify --> API[/api/events]
```

### One-week decision

**YES** — This is a small, focused change: one new utility function + one call site + tests. Estimated effort: 1-2 hours.

### Implementation plan

1. **Add `stripSourceSuffix` function** in `src/lib/rss-client.ts`
   - Use regex: match ` - <1-5 words>$` at end of string
   - Only strip if the remaining title is still >= 15 chars (avoid over-stripping)
   - Export for testing

2. **Apply in `rssItemToArticle`** — call `stripSourceSuffix(title)` only when `feedSource` starts with "Google News"

3. **Add tests** in `src/lib/__tests__/rss-client.test.ts`
   - Test stripping common patterns: " - PBS", " - The Washington Post", " - CBS News"
   - Test no-stripping when title would become too short
   - Test no-stripping for non-Google-News sources

4. **Verify** — run full test suite, check API response, browse app

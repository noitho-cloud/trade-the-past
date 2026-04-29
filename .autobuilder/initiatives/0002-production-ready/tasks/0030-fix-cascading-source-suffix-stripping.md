---
id: trade-the-past-fix-cascading-source-suffix-stripping
title: "Fix stripSourceSuffix to handle cascading source suffixes in Google News titles"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Overview

The `stripSourceSuffix` function strips a single trailing source-name suffix from Google News RSS titles. However, Google News RSS sometimes produces titles with cascading attributions (e.g. `Title | DailySabah - Daily Sabah`), and after stripping only the outermost one, an inner suffix remains visible to users.

## Research notes

- The current function (`src/lib/rss-client.ts:218-234`) uses `Math.max(lastIndexOf(" - "), lastIndexOf(" | "))` to find the separator closest to the end, then strips once.
- Google News RSS feed titles follow the pattern: `<Original Article Title> - <Source Name>`. Some article titles already contain `|` separators from the original source.
- Manual testing confirms the function logic is correct for a single pass. The fix is to iterate until no more short suffixes remain.
- Existing test coverage in `src/lib/__tests__/rss-client.test.ts` covers single-suffix cases.
- The function is only called during RSS ingestion, so the performance impact of looping is negligible.

## Architecture diagram

```mermaid
graph LR
    RSS[Google News RSS] --> parse[parseRSS]
    parse --> rssItemToArticle
    rssItemToArticle --> strip[stripSourceSuffix loop]
    strip --> RawArticle[RawArticle.title]
    RawArticle --> classify[classifyAndRank]
    classify --> API[/api/events]
```

## One-week decision

**YES** — This is a ~30 minute change: modify one function to loop, add 3-4 test cases.

## Implementation plan

1. Modify `stripSourceSuffix` in `src/lib/rss-client.ts` to loop until no suffix can be stripped
2. Add test cases in `src/lib/__tests__/rss-client.test.ts` for cascading suffixes
3. Run full test suite to verify no regressions
4. Verify in browser that affected titles render cleanly

## Problem statement

The `stripSourceSuffix` function in `src/lib/rss-client.ts` only strips a single source suffix from Google News RSS titles. Google News RSS often produces titles with cascading source attribution like:

```
"Turkish central bank keeps key policy rate unchanged again | Daily Sabah - Daily Sabah"
```

The function finds the LAST separator (` - Daily Sabah`) and strips it, but leaves the inner separator (` | Daily Sabah`) intact. The result is:

```
"Turkish central bank keeps key policy rate unchanged again | Daily Sabah"
```

This is visible right now in the weekly view's last event card (WED 22 APR) and in the `/api/events` response.

## User story

As a trader viewing the weekly event list, I want event titles to be clean and free of source attribution suffixes, so that I can focus on the content without visual noise from aggregator metadata.

## How it was found

During a surface-sweep review of the live app at `http://localhost:3050`, the event "Turkish central bank keeps key policy rate unchanged again | Daily Sabah" still shows the `| Daily Sabah` suffix despite tasks 0024 and 0026 implementing source suffix stripping. Manual testing of the `stripSourceSuffix` function confirms it only strips one layer of suffix. The `/api/events` endpoint returns the title with the suffix intact.

## Proposed fix

Modify `stripSourceSuffix` in `src/lib/rss-client.ts` to loop until no more source-like suffixes remain:

```typescript
export function stripSourceSuffix(title: string): string {
  if (!title) return title;
  let result = title;
  for (;;) {
    const dashIdx = result.lastIndexOf(" - ");
    const pipeIdx = result.lastIndexOf(" | ");
    const idx = Math.max(dashIdx, pipeIdx);
    if (idx < 0) break;
    const suffix = result.slice(idx + 3).trim();
    const wordCount = suffix.split(/\s+/).length;
    if (wordCount > 5) break;
    const stripped = result.slice(0, idx).trim();
    if (stripped.length < 15) break;
    result = stripped;
  }
  return result;
}
```

## Acceptance criteria

- [ ] `stripSourceSuffix` strips multiple cascading source suffixes (e.g. `Title | Source - Source` → `Title`)
- [ ] Function still preserves titles where the separator is part of the content (suffix > 5 words)
- [ ] Function still preserves titles that would become too short (< 15 chars) after stripping
- [ ] Existing tests for single-suffix stripping still pass
- [ ] New test cases cover cascading suffix scenarios
- [ ] The "Turkish central bank keeps key policy rate unchanged again | Daily Sabah" title is stripped to "Turkish central bank keeps key policy rate unchanged again" in the events API response

## Verification

- Run `npm test` — all tests pass
- Verify via `curl http://localhost:3050/api/events` that no titles contain source suffixes
- Open the app in agent-browser and visually confirm clean titles in the weekly view

## Out of scope

- Stripping source prefixes (e.g. "InvestingLive Americas FX news wrap: ...")
- Changes to event classification or ranking logic
- RSS feed source configuration changes

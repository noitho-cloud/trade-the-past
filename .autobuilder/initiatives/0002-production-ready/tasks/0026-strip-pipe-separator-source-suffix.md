---
id: trade-the-past-strip-pipe-separator-source-suffix
title: "Extend source suffix stripping to handle pipe separator in event titles"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem Statement

The `stripSourceSuffix` function in `src/lib/rss-client.ts` only handles ` - ` as a separator between the title and source attribution. However, some RSS feeds use ` | ` as the separator. This results in titles like "Turkish central bank keeps key policy rate unchanged again | Daily Sabah" displaying the source name in the UI.

This was observed in the browser on the weekly view — the WED 22 APR card shows the full title including " | Daily Sabah".

## User Story

As a trader, I want event titles to be clean and free of source attribution suffixes, so that the weekly view and event detail pages are easy to scan without noise.

## How It Was Found

Browser review (surface sweep iteration #20). The event card for WED 22 APR in global scope displays: "Turkish central bank keeps key policy rate unchanged again | Daily Sabah". The `stripSourceSuffix` function was implemented in task 0024 but only handles ` - ` separators.

## Proposed UX

Event titles should have both ` - Source` and ` | Source` suffixes stripped. The source attribution is already shown separately in the card UI.

## Acceptance Criteria

- [ ] `stripSourceSuffix` handles both ` - ` and ` | ` separators
- [ ] Titles like "Some headline | Daily Sabah" become "Some headline"
- [ ] Existing ` - ` stripping still works (no regression)
- [ ] Short suffixes (1-5 words after separator) are stripped; longer ones are preserved as they're likely part of the title
- [ ] Unit tests cover both ` - ` and ` | ` separator patterns
- [ ] Turkish central bank event title displays without " | Daily Sabah" in the UI

## Verification

- Run existing tests: `npm test`
- Verify in browser that the WED 22 APR event shows a clean title

## Out of Scope

- Stripping source prefixes (e.g., "investingLive" at the start of titles) — different pattern, separate task
- Changing how the source field is populated

---

## Planning

### Overview

Small, focused enhancement to `stripSourceSuffix` in `src/lib/rss-client.ts`. Currently the function only looks for ` - ` as a separator between the title and a source attribution suffix. Some RSS feeds (e.g., Daily Sabah) use ` | ` instead. The fix is to check both separators and strip whichever appears last.

### Research Notes

- The function already has good guard rails: suffix must be ≤5 words, remaining title must be ≥15 chars.
- Both ` - ` and ` | ` are common source attribution patterns in RSS feeds.
- The existing test suite has 9 tests for `stripSourceSuffix` covering edge cases.

### Assumptions

- No other separator patterns need handling (e.g., ` :: ` or ` // ` are not observed).

### Architecture Diagram

```mermaid
graph LR
    A[RSS Item Title] --> B{stripSourceSuffix}
    B -->|lastIndexOf ' - '| C[candidate 1]
    B -->|lastIndexOf ' \| '| D[candidate 2]
    C --> E{Pick rightmost match}
    D --> E
    E --> F{suffix ≤5 words?}
    F -->|yes| G{remaining ≥15 chars?}
    G -->|yes| H[Stripped title]
    F -->|no| I[Original title]
    G -->|no| I
```

### One-Week Decision

**YES** — This is a ~30 minute change: modify one function, add 3-4 test cases.

### Implementation Plan

1. Modify `stripSourceSuffix` to find both ` - ` and ` | ` separators and use whichever appears last (rightmost)
2. Apply the same word-count and min-length guards to both
3. Add test cases for ` | ` separator: basic case, short remaining title, long suffix, combined with ` - ` in title body
4. Run full test suite to verify no regressions

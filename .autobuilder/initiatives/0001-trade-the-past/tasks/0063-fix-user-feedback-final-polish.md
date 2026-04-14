---
id: trade-the-past-fix-user-feedback-final-polish
title: "Fix user feedback: header, watchlist button, unified insight, non-tradeable assets, hydration, polish"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem Statement

The product owner provided 7 critical feedback items that must all be fixed before presentation. These include: header colors wrong in light mode, Watchlist button wrong in light mode, historical matches shown as separate blocks instead of unified narrative, non-eToro-tradeable assets in mock data, hydration errors, visual polish gaps, and mobile presentation issues.

## User Story

As a product owner preparing for a presentation, I want all visual and data issues fixed so that the app looks polished and professional in both light and dark modes.

## How It Was Found

Direct product owner feedback.

## Feedback Items

### 1. Fix header in light mode
- Header is navy (#000021) in both modes — WRONG for light mode
- Light mode: white background, navy text, #E5E5E5 bottom border
- Dark mode: navy (#000021) background — correct
- Theme toggle icon should match header background
- Date text in header should match header context

### 2. Fix Watchlist button style
- Light mode: white background, #E5E5E5 border (secondary)
- Dark mode: transparent background, #2A2A4E border (outlined)
- Trade = green filled pill (correct)

### 3. Unify historical matches into ONE insight
- Merge separate year blocks into one narrative paragraph
- Show ONE consolidated market reaction table
- Remove separate year blocks with individual descriptions

### 4. Remove non-eToro-tradeable assets
- Remove ARKK ETF, iShares Clean Energy ETF from mock data (ETFs not in allowed categories)
- Replace with eToro-tradeable alternatives
- Only keep: stocks, indices, commodities, crypto, forex

### 5. Fix hydration errors
- Date formatting in layout.tsx could differ server/client
- Ensure consistent date formatting

### 6. Visual polish
- Consistent spacing
- Key Takeaway box prominence
- Text readability in both modes
- Footer disclaimer text: #6B7280 light, #8B8BA7 dark

### 7. Mobile presentation-ready
- 375px width clean stacking
- Full-width cards and CTAs on mobile

## Research Notes

- `--header-bg` is set to `var(--navy)` in both :root and .dark — needs to change for light mode
- `HeaderLink.tsx` has hardcoded `text-white` — needs to use `text-[var(--header-text)]`
- `ThemeToggle.tsx` has hardcoded `text-white/70` and `hover:text-white` — needs adaptation
- Layout date text has hardcoded `text-white/60` — needs adaptation
- `UnifiedInsight.tsx` renders separate `MatchBlock` per year — needs to be merged into one narrative
- Mock data has ARKK ETF and iShares Clean Energy ETF which are not eToro-tradeable as individual instruments
- Hydration: `new Date()` in layout.tsx runs on both server and client with potentially different times

## Architecture

```mermaid
graph TD
    A[globals.css] -->|Fix --header-bg, --header-text for light mode| B[Header styling]
    C[HeaderLink.tsx] -->|Use var(--header-text)| B
    D[ThemeToggle.tsx] -->|Use var(--header-text) colors| B
    E[layout.tsx] -->|Fix date text color, hydration| B
    F[UnifiedInsight.tsx] -->|Merge blocks into unified narrative| G[Detail page]
    H[mock-data.ts] -->|Remove non-tradeable ETFs| I[Data layer]
    J[etoro-slugs.ts] -->|Remove ARKK, ICLN slugs| I
    K[AffectedAssets.tsx] -->|Fix Watchlist button dark mode| G
```

## One-Week Decision

**YES** — All changes are CSS/styling tweaks, component text changes, and mock data cleanup. Straightforward edits across 8-10 files.

## Implementation Plan

1. Fix CSS variables: update `--header-bg` and `--header-text` for light mode
2. Update HeaderLink, ThemeToggle, layout.tsx to use CSS variables instead of hardcoded colors
3. Rewrite UnifiedInsight to produce one merged narrative instead of per-year blocks
4. Remove non-tradeable ETFs from mock data and etoro-slugs
5. Fix hydration by moving date rendering to client component
6. Fix Watchlist button for dark mode transparency
7. Verify mobile at 375px

## Acceptance Criteria

- [ ] Light mode: header is white with navy text and #E5E5E5 bottom border
- [ ] Dark mode: header is navy (#000021) with white text
- [ ] Theme toggle icon matches header context
- [ ] Watchlist button: white bg + #E5E5E5 border in light, transparent bg + #2A2A4E border in dark
- [ ] Historical matches merged into ONE unified narrative paragraph
- [ ] ONE consolidated market reaction table (no separate year blocks)
- [ ] No ARKK ETF, iShares Clean Energy ETF, 10Y Treasury, or USD Index in mock data
- [ ] No hydration errors in console
- [ ] Footer disclaimer uses muted colors
- [ ] Mobile stacks cleanly at 375px

## Verification

Run all tests, build, and verify in browser with agent-browser screenshots.

## Out of Scope

- New features or pages
- API integration changes
- Performance optimization

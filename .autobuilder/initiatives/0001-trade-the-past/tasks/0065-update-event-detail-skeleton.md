---
id: trade-the-past-update-event-detail-skeleton
title: "Update event detail loading skeleton to match current page structure"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem Statement

The event detail loading skeleton (`src/app/event/[id]/loading.tsx`) reflects an outdated page structure. It shows:
- Individual match blocks with `border-l-2` quote borders
- A single CTA button at the bottom
- A hero image with `aspect-[2.4/1]` (taller than actual `h-48`)

The actual page now uses:
- A unified narrative paragraph
- A consolidated market reaction table with header bar
- A Key Takeaway callout with left green border
- An "Affected Assets" grid of cards with Trade/Watchlist buttons
- Prev/Next event navigation at the bottom

The mismatch causes a visible layout shift when the RSC stream resolves — the skeleton is structurally different from the rendered content.

## User Story

As a user navigating to an event detail page, I want the loading skeleton to closely preview the actual page structure so the transition from skeleton to content feels smooth with minimal layout shift.

## How It Was Found

Visual polish review comparing the loading skeleton code against the actual rendered event detail page structure. The skeleton was written before the UnifiedInsight consolidation and AffectedAssets grid were implemented.

## Proposed UX

Update `src/app/event/[id]/loading.tsx` to mirror the current page sections:
1. Back link placeholder
2. Hero image placeholder at `h-48` (not aspect-ratio)
3. Badge + date row
4. Title block (1-2 lines)
5. Source text
6. Summary paragraph (2-3 lines)
7. "What History Tells Us" section header with horizontal line
8. Narrative paragraph placeholder (3-4 lines)
9. Consolidated Market Reaction card with table header bar + 3 shimmer rows
10. Key Takeaway callout box with green left border
11. "Affected Assets" section header with horizontal line
12. Grid of 3 asset card skeletons (matching the card structure)
13. Navigation bar at bottom (prev/next placeholders)

## Acceptance Criteria

- [ ] Loading skeleton hero uses `h-48` (not aspect-ratio)
- [ ] Skeleton includes "What History Tells Us" section header with line
- [ ] Skeleton includes consolidated table card structure (header bar + rows)
- [ ] Skeleton includes Key Takeaway callout with `border-l-4 border-[var(--etoro-green)]` and green-tinted background
- [ ] Skeleton includes "Affected Assets" section header with line
- [ ] Skeleton includes 3 asset card placeholders in a responsive grid
- [ ] Skeleton includes bottom navigation bar placeholder
- [ ] No old `border-l-2` quote blocks remain
- [ ] No old single CTA button remains
- [ ] Build passes with no errors

## Verification

- Run `npm run build` — no errors
- Navigate to event detail page and observe loading skeleton briefly matches the final layout

## Out of Scope

- Changing the actual page layout
- Adding animation beyond `animate-pulse`
- Modifying the weekly view loading skeleton

---
id: trade-the-past-stream-historical-data-via-suspense
title: "Stream historical data via Suspense to eliminate client-side fetch waterfall"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem statement

The event detail page has a client-server waterfall that adds 1-2 seconds of unnecessary latency. The flow is:

1. Server component calls `getEventById(id, { skipHistorical: true })` — renders page shell fast
2. Page hydrates on client
3. `HistoricalSection` client component fires `fetch('/api/events/${eventId}')` to get historical data
4. The API route calls `getEventById(id)` again (full, with historical matching)
5. Response returns and client re-renders with historical data

This creates a **sequential waterfall**: the historical data fetch can't start until the page has fully rendered and hydrated on the client. Additionally, in development mode, React Strict Mode causes two identical API calls to fire (observed: two `/api/events/live-global-1-2026-04-29` requests at startTime 17615ms and 17616ms).

The API re-fetches the *entire* event just to get `historicalMatches`, wasting bandwidth and server resources on data already rendered in the page shell.

## User story

As a trader, I want the historical analysis section to load as fast as possible when I click an event, so that I can quickly see historical parallels and make trading decisions without waiting.

## How it was found

Performance profiling via browser `performance.getEntriesByType("resource")` on the event detail page showed:
- RSC navigation: 21ms (fast)
- Then 2 duplicate client-side fetches to `/api/events/{id}` starting at t+17615ms (after hydration)
- The duplicate fetches had 0 transfer size (server cache hit) but still represent unnecessary round-trips and waterfall delay

## Research notes

- **React 19 Suspense streaming**: Server components wrapped in `<Suspense>` automatically stream their content to the client when data resolves. No client-side fetch needed.
- **Next.js 16**: Full support for async server components inside Suspense boundaries. The page shell renders immediately, and the Suspense fallback shows until the async component resolves.
- **Existing architecture**: `getEventById(id, { skipHistorical: true })` is fast (RSS cache hit), while `getHistoricalMatches()` is slow (may call OpenAI). The skip pattern was intentionally designed to avoid blocking the shell.
- **Key insight**: Instead of skip+client-fetch, we can use Suspense streaming: render the shell immediately, and stream historical data from a second server component.

## Assumptions

- The `getHistoricalMatches` function is safe to call from a server component (it only uses server-side APIs).
- The existing `HistoricalSection` test suite tests the client-side fetch/retry behavior, which will change.

## Architecture diagram

```mermaid
graph TD
    A[Event Detail Page - Server Component] --> B[Header: title, badge, summary]
    A --> C["Suspense boundary (fallback = skeleton)"]
    A --> D[EventNavigation]
    C --> E[HistoricalDataLoader - async Server Component]
    E -->|calls| F[getHistoricalMatches]
    F -->|OpenAI or built-in DB| G[HistoricalMatch[]]
    E -->|passes matches as props| H[HistoricalSectionClient - Client Component]
    H --> I[UnifiedInsight]
    H --> J[AffectedAssets]
    H -->|retry only| K["fetch /api/events/{id} (fallback)"]

    style C fill:#f0f9ff,stroke:#0ea5e9
    style E fill:#ecfdf5,stroke:#10b981
```

**Before**: Page → skipHistorical → hydrate → client fetch → render matches
**After**: Page → shell renders immediately → Suspense streams matches from server → no client fetch

## One-week decision

**YES** — This is a focused refactoring of two files (page.tsx and HistoricalSection.tsx) plus test updates. Estimated 2-3 hours.

## Implementation plan

### Phase 1: Create async server wrapper component

In `src/app/event/[id]/page.tsx`:
1. Create an `async function HistoricalDataLoader({ eventId, title, type, summary, source })` server component
2. It calls `getHistoricalMatches(title, type, summary, source)` directly
3. Passes resolved matches to a simplified `HistoricalSectionClient`
4. Wrap in `<Suspense fallback={<HistoricalSkeleton />}>` in the page

### Phase 2: Simplify HistoricalSection client component

Convert `HistoricalSection` to receive `matches` as resolved data (not empty + fetch):
1. Remove the `useEffect` that fires the initial fetch
2. Keep the `fetchMatches` callback only for the "Try again" retry button
3. Accept new props: `matches: HistoricalMatch[]` (resolved), `eventId: string` (for retry)
4. If `matches` is empty, show empty state
5. If user clicks retry, use client-side fetch as fallback

### Phase 3: Extract skeleton to shared component

Move the loading skeleton from HistoricalSection into a separate export (`HistoricalSkeleton`) so it can be used as the Suspense fallback in the page.

### Phase 4: Handle server-side errors

If `getHistoricalMatches` throws in the server component:
- Use React error boundary or try/catch in the async component
- Pass an `error` flag to the client component so it shows the retry UI

### Phase 5: Update tests

- Update HistoricalSection tests to reflect new props (matches come pre-resolved)
- Keep retry test (still uses client-side fetch)
- Remove tests for initial fetch behavior (no longer applies)

## Proposed UX

No visual change. The loading skeleton for historical data still appears while data streams. The difference is architectural:
- Historical data starts loading on the server immediately (in parallel with sending the page shell)
- React streams the completed historical data to the client when ready
- No separate client-side fetch needed
- Retry on failure still works (client component keeps retry ability)

## Acceptance criteria

- [ ] Historical data loads via server-side Suspense streaming, not a client-side fetch waterfall
- [ ] The page shell (title, badge, summary, back link) renders immediately without waiting for historical data
- [ ] A loading skeleton shows while historical data streams
- [ ] If historical matching fails, an error state with a "Try again" button is displayed
- [ ] The "Try again" button triggers a client-side fetch (fallback for retry)
- [ ] No duplicate API calls to `/api/events/{id}` on initial page load
- [ ] All existing tests pass
- [ ] No regressions in the event detail page layout

## Verification

- Run `npm test` — all tests pass
- Open event detail in browser, check network tab — no `/api/events/{id}` fetch on initial load
- Historical data appears after streaming completes
- Screenshot the loaded page as evidence

## Out of scope

- Changing how historical matching works (OpenAI vs built-in DB)
- Caching historical matches across page navigations
- Prefetching event data on hover from the weekly view

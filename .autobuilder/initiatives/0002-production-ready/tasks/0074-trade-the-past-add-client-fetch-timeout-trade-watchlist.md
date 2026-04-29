---
id: trade-the-past-add-client-fetch-timeout-trade-watchlist
title: "Add client-side fetch timeouts to trade and watchlist operations"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem Statement

The `TradeDialog` and `WatchlistStar` components issue fetch calls to `/api/etoro/trade` and `/api/etoro/watchlist` without any client-side timeout (`AbortSignal.timeout()`). By contrast, the `HistoricalSection` retry fetch already uses `AbortSignal.timeout(15000)`. If the server is slow (Vercel cold start, GC pause, heavy load), the "Executing..." and loading spinners show indefinitely with no automatic timeout or user feedback.

The `AuthProvider.connect()` and `AuthProvider.checkSession()` also lack client-side fetch timeouts.

## User Story

As a trader executing a trade or adding to my watchlist, I want the operation to either succeed or fail within a reasonable time, so that I know whether my action was processed without staring at an infinite spinner.

## How It Was Found

Edge case review: tested the trade and watchlist flows by inspecting the source code. The `HistoricalSection` (line 65) uses `AbortSignal.timeout(15000)` but `TradeDialog` (line 50), `WatchlistStar` (line 96 of AffectedAssets.tsx), and `AuthProvider` fetch calls have no timeout.

## Proposed UX

- Add `signal: AbortSignal.timeout(15_000)` to the trade fetch in `TradeDialog`
- Add `signal: AbortSignal.timeout(10_000)` to the watchlist fetch in `WatchlistStar`
- Add `signal: AbortSignal.timeout(10_000)` to `connect()` and `checkSession()` in `AuthProvider`
- On timeout, show a toast: "Request timed out — please try again" (trade/watchlist) or an error message (connect modal)
- The existing `catch` blocks already handle network errors; they just need to distinguish timeout from other errors

## Acceptance Criteria

- [ ] TradeDialog fetch uses AbortSignal.timeout(15_000)
- [ ] WatchlistStar fetch uses AbortSignal.timeout(10_000)
- [ ] AuthProvider connect() uses AbortSignal.timeout(10_000)
- [ ] AuthProvider checkSession() uses AbortSignal.timeout(10_000)
- [ ] Timeout errors show a user-friendly "timed out" message, not a generic network error
- [ ] Existing tests continue to pass
- [ ] New tests verify timeout behavior for at least one of the above

## Verification

- Run full test suite: `npm test`
- Review the code changes for consistent timeout usage

## Out of Scope

- Server-side timeout changes (already handled in eToro proxy with AbortSignal.timeout(10_000))
- Adding cancellation buttons to spinners (the user can close modals instead)

---

## Planning

### Overview

Add `AbortSignal.timeout()` to 4 client-side fetch calls across 3 components to prevent infinite spinners when the server is slow. This is a small, consistent change — adding one option to each fetch call and updating catch blocks to detect timeout errors.

### Research Notes

- `AbortSignal.timeout(ms)` is supported in all modern browsers (Chrome 103+, Firefox 100+, Safari 16+)
- When the signal fires, `fetch` throws a `DOMException` with `name === "TimeoutError"`
- The existing `HistoricalSection` already uses this pattern successfully at line 65
- The existing catch blocks in `TradeDialog` and `WatchlistStar` catch all errors; they just show generic "Network error" messages that need to be updated to distinguish timeouts
- The `AuthProvider.checkSession()` is called on mount; a timeout here just means the session check fails silently (user appears disconnected), which is acceptable

### Assumptions

- `AbortSignal.timeout` is available in the target browser matrix (Next.js 14+ targets modern browsers)
- 15s is appropriate for trade operations (matching HistoricalSection), 10s for watchlist and auth (lighter operations)

### Architecture Diagram

```mermaid
graph LR
    subgraph Client Components
        TD[TradeDialog] -->|fetch + timeout 15s| TradeAPI[/api/etoro/trade]
        WS[WatchlistStar] -->|fetch + timeout 10s| WatchlistAPI[/api/etoro/watchlist]
        AP[AuthProvider.connect] -->|fetch + timeout 10s| AuthAPI[/api/auth/etoro]
        AP2[AuthProvider.checkSession] -->|fetch + timeout 10s| SessionAPI[/api/auth/session]
    end
    subgraph Error Handling
        TD -->|TimeoutError| Toast1[Toast: timed out]
        WS -->|TimeoutError| Toast2[Toast: timed out]
        AP -->|TimeoutError| ErrorMsg[Error: timed out]
    end
```

### One-Week Decision

**YES** — This is a straightforward change: add `signal` option to 4 fetch calls and update 4 catch blocks to detect `TimeoutError`. Estimated effort: 1-2 hours including tests.

### Implementation Plan

1. **TradeDialog.tsx**: Add `signal: AbortSignal.timeout(15_000)` to the trade fetch. Update the catch block to check for `TimeoutError` and show "Trade timed out — please try again" toast.
2. **AffectedAssets.tsx (WatchlistStar)**: Add `signal: AbortSignal.timeout(10_000)` to the watchlist fetch. Update catch to show "Watchlist request timed out — please try again" toast.
3. **AuthProvider.tsx**: Add timeouts to both `connect()` (10s) and `checkSession()` (10s). For connect, show "Connection timed out — please try again" error. For checkSession, silently fail (existing behavior).
4. **Tests**: Add a test for TradeDialog timeout behavior using `vi.useFakeTimers` or mocking fetch to simulate a timeout.
5. **Verify**: Run full test suite.

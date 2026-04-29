---
id: trade-the-past-distinguish-etoro-auth-errors-from-not-found
title: "Distinguish eToro auth failures from instrument-not-found in API error responses"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem statement

The `searchInstrument` function in `etoro-proxy.ts` returns `null` for both authentication failures (401/403 from eToro) and genuine instrument-not-found results. All three eToro API routes (search, trade, watchlist) then return "Instrument not found" (404) regardless of the actual failure reason. When a user's API keys become invalid (revoked, expired), they see "Instrument not found" instead of a message indicating their credentials need to be updated.

## User story

As a trader whose API keys have expired, I want to see "API keys invalid — please reconnect" rather than "Instrument not found" so that I know what action to take.

## How it was found

During error-handling review: traced the code path in `etoro-proxy.ts` — `searchInstrument` returns `null` when `!res.ok`, which covers both 401 (auth failure) and 404 (not found). In the trade route, `if (!instrument)` returns `{ error: "Instrument not found" }` for both cases. Confirmed by entering invalid keys and attempting trade — got misleading "Instrument not found" toast.

## Proposed UX

1. When eToro returns 401 or 403, the API route should return `{ error: "eToro API keys are invalid — please reconnect" }` with status 401.
2. The client-side trade/watchlist code should detect 401 responses and show the Connect eToro modal automatically (or prompt reconnection).
3. Genuine "Instrument not found" (eToro returns 200 with empty results) should continue showing the current message.

## Acceptance criteria

- [ ] `searchInstrument` throws a typed `EtoroAuthError` on 401/403 instead of returning null
- [ ] Trade, search, and watchlist API routes catch `EtoroAuthError` and return `{ error: "eToro API keys are invalid — please reconnect" }` with status 401
- [ ] Client-side trade dialog and watchlist star show the auth error message (not "Instrument not found")
- [ ] Genuine instrument-not-found still returns 404 with "Instrument not found"
- [ ] Other eToro API errors (500, 502) still return the existing generic messages
- [ ] All existing tests pass; new tests cover auth error path

## Verification

- Run all tests: `npm test`
- Build: `npm run build`
- Trace code to confirm 401/403 triggers `EtoroAuthError`

## Out of scope

- Automatic key re-validation / refresh
- Auto-opening Connect modal on 401 (nice-to-have but not required)
- Changes to the connect flow itself (separate task)

---

## Planning

### Overview

The `searchInstrument` function in `etoro-proxy.ts` currently returns `null` for all non-200 responses, conflating auth failures (401/403) with genuine not-found (200 with empty results). This task introduces a typed `EtoroAuthError` that propagates through the API routes, giving users actionable error messages.

### Research notes

- `searchInstrument` is called from 3 routes: `/api/etoro/search`, `/api/etoro/trade`, `/api/etoro/watchlist`.
- All 3 routes check `if (!instrument)` and return "Instrument not found" (404).
- The `res.ok` check in `searchInstrument` catches all non-200 statuses — including 401/403 (auth) and 500 (server error).
- The watchlist route also makes a direct fetch to eToro for the watchlist API, which has the same auth error confusion.

### Assumptions

- eToro returns 401 or 403 for invalid API keys (standard REST behavior).
- Other 4xx/5xx codes represent transient or server errors, not auth issues.

### Architecture diagram

```mermaid
graph TD
    A[searchInstrument] -->|res.status 401/403| B[throw EtoroAuthError]
    A -->|res.ok, empty items| C[return null]
    A -->|res.ok, has items| D[return result]
    A -->|other !res.ok| E[return null unchanged]
    
    F[/api/etoro/trade] -->|catches EtoroAuthError| G[401: Keys invalid]
    F -->|instrument === null| H[404: Instrument not found]
    
    I[/api/etoro/watchlist] -->|catches EtoroAuthError| G
    J[/api/etoro/search] -->|catches EtoroAuthError| G
```

### One-week decision

**YES** — This is a focused refactor: define one error class, update `searchInstrument` to throw it on 401/403, update 3 route handlers to catch it. ~30 lines of changes across 4 files plus tests.

### Implementation plan

1. **Define `EtoroAuthError`** in `etoro-proxy.ts`: A custom Error subclass with a message indicating invalid keys.
2. **Update `searchInstrument`**: Check `res.status` before `res.ok`. If 401 or 403, throw `EtoroAuthError`. Keep existing `return null` for other non-200 and empty results.
3. **Update watchlist route**: The direct fetch to eToro watchlist API also needs a 401/403 check before the generic "Failed to add to watchlist".
4. **Update 3 API routes** (`search`, `trade`, `watchlist`): Add a catch block for `EtoroAuthError` that returns `{ error: "eToro API keys are invalid — please reconnect" }` with status 401.
5. **Add tests**: Test `searchInstrument` throws `EtoroAuthError` on 401/403. Test routes return 401 with auth error message.

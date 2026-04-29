---
id: trade-the-past-sanitize-user-input-in-etoro-error-messages
title: "Sanitize user input echoed in eToro API error messages"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem statement

Three eToro API routes echo unsanitized user input (`symbol`) directly in error messages returned to the client:

- `/api/etoro/trade` — `Instrument not found: ${symbol}` (line 59)
- `/api/etoro/search` — `Instrument not found: ${symbol}` (line 38)
- `/api/etoro/watchlist` — `Instrument not found: ${symbol}` (line 38)

Tested with `curl -s -X POST -H "Content-Type: application/json" -d '{"symbol":"<script>alert(1)</script>","isBuy":true,"amount":100}' http://localhost:3050/api/etoro/trade` which returned:

```json
{"error":"Instrument not found: <script>alert(1)</script>"}
```

This violates the initiative constraint: **"Sanitize all error messages before sending to client."**

While React escapes text content by default (so XSS isn't exploitable in the current UI), the server should never reflect raw user input in error responses — attackers can send arbitrarily long strings, unicode exploits, or use the echo for reconnaissance.

## User story

As a security-conscious developer, I want API error messages to never include raw user input, so that the app follows defense-in-depth principles and satisfies the production hardening constraints.

## How it was found

During surface sweep review, testing the eToro trade flow with a malicious symbol payload revealed the error message reflects user input verbatim.

## Proposed UX

Error messages should use a generic message without echoing the input:
- `"Instrument not found"` (no symbol echo)
- Or if context is needed: truncate and sanitize the symbol to alphanumeric only, max 20 chars

## Acceptance criteria

- [ ] `/api/etoro/trade` does NOT echo user-provided `symbol` in error responses
- [ ] `/api/etoro/search` does NOT echo user-provided `symbol` in error responses
- [ ] `/api/etoro/watchlist` does NOT echo user-provided `symbol` in error responses
- [ ] All existing tests pass
- [ ] Manual test: sending `<script>alert(1)</script>` as symbol returns a clean error message

## Verification

Run `curl -s -X POST -H "Content-Type: application/json" -d '{"symbol":"<script>alert(1)</script>","isBuy":true,"amount":100}' http://localhost:3050/api/etoro/trade` and verify the response does NOT contain the script tag.

## Out of scope

- Changing success responses
- Adding input validation beyond what already exists
- Adding CSP headers (separate concern)

---

## Planning

### Overview

Simple fix: remove user-provided `symbol` from error messages in 3 API route handlers. Replace interpolated messages with static strings.

### Research notes

- The pattern `Instrument not found: ${symbol}` appears in exactly 3 files
- React escapes text content by default, so this isn't an active XSS vulnerability, but it violates defense-in-depth and the explicit constraint
- Server-side logging already captures the symbol for debugging, so removing it from client responses loses no observability

### Assumptions

- The generic message "Instrument not found" provides enough context for the user
- Server logs retain the symbol for debugging purposes (confirmed: logger calls already log the symbol)

### Architecture diagram

```mermaid
graph LR
    Client -->|POST symbol| TradeRoute[/api/etoro/trade]
    Client -->|POST symbol| SearchRoute[/api/etoro/search]
    Client -->|POST symbol| WatchlistRoute[/api/etoro/watchlist]
    TradeRoute -->|"Instrument not found"| Client
    SearchRoute -->|"Instrument not found"| Client
    WatchlistRoute -->|"Instrument not found"| Client
```

### One-week decision

**YES** — This is a 3-line change across 3 files. Estimated effort: 15 minutes.

### Implementation plan

1. Change `Instrument not found: ${symbol}` to `"Instrument not found"` in:
   - `src/app/api/etoro/trade/route.ts`
   - `src/app/api/etoro/search/route.ts`
   - `src/app/api/etoro/watchlist/route.ts`
2. Update any existing tests that assert on the old error message format
3. Run full test suite to verify no regressions

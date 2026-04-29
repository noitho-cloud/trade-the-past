---
id: trade-the-past-remove-unsafe-eval-from-csp
title: "Remove unsafe-eval from Content-Security-Policy script-src directive"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem Statement

The `Content-Security-Policy` header in `next.config.ts` includes `'unsafe-eval'` in the `script-src` directive. This allows `eval()`, `Function()`, and similar dynamic code execution in the browser, which is a known XSS attack vector. For a financial trading app that handles eToro API keys, this weakens the security posture unnecessarily. Next.js production builds do not require `'unsafe-eval'` — it is only needed in development mode for hot module replacement.

## User Story

As a user entrusting my eToro API keys to this app, I want the strictest possible Content-Security-Policy so that even if an attacker finds an injection point, they cannot execute arbitrary JavaScript via eval().

## How It Was Found

During a surface sweep review, the response headers were inspected via `curl -sI http://localhost:3050`. The CSP header showed:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```
The `'unsafe-eval'` directive is unnecessary for production Next.js builds and represents a gap in the Production Hardening scope.

## Proposed Fix

1. Remove `'unsafe-eval'` from the `script-src` directive in `next.config.ts` security headers
2. Verify the production build (`npm run build && npm start`) still works correctly without it
3. Update the CSP test in `src/lib/__tests__/security-headers.test.ts` to assert `'unsafe-eval'` is NOT present

## Acceptance Criteria

- [ ] `next.config.ts` CSP `script-src` no longer includes `'unsafe-eval'`
- [ ] `npm run build` succeeds
- [ ] `npm start` serves pages without CSP violations in the browser console
- [ ] The existing CSP test is updated to verify `'unsafe-eval'` is absent
- [ ] All existing tests pass

## Verification

- Run `npm run build && npm start` and verify no CSP errors in the browser console
- Run `curl -sI http://localhost:3050` and confirm `'unsafe-eval'` is not in the CSP header
- Run `vitest run` and verify all tests pass

## Out of Scope

- Removing `'unsafe-inline'` (still needed for the theme init script)
- Adding CSP nonce support (would require Next.js middleware changes)
- Changing other CSP directives

---

## Planning

### Overview

Remove `'unsafe-eval'` from the CSP `script-src` directive in `next.config.ts`. This is a one-line config change plus a test assertion update. Next.js production builds do not use `eval()` — it's only needed in dev mode for HMR/Turbopack, and CSP headers from `next.config.ts` do not apply in dev mode anyway.

### Research Notes

- Next.js applies custom headers from `next.config.ts` only to production builds served via `next start`
- In dev mode (`next dev`), custom headers are applied but Turbopack may inject eval-based code anyway
- The theme init script uses `dangerouslySetInnerHTML` with a static string, not `eval()`, so `'unsafe-eval'` is not needed for it
- `'unsafe-inline'` must remain because the theme init script is an inline `<script>` tag

### Architecture Diagram

```mermaid
graph LR
  A[next.config.ts] -->|headers()| B[CSP Header]
  B -->|script-src| C["'self' 'unsafe-inline'"]
  D[security-headers.test.ts] -->|asserts| B
```

### One-Week Decision

**YES** — This is a 2-file change (config + test), completable in minutes.

### Implementation Plan

1. Edit `next.config.ts` line 15: remove `'unsafe-eval'` from the script-src value
2. Edit `src/lib/__tests__/security-headers.test.ts`: add assertion that CSP does NOT contain `'unsafe-eval'`
3. Run `vitest run` to verify tests pass
4. Run `npm run build` to verify production build succeeds

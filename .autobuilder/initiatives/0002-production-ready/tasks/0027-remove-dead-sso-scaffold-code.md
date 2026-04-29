---
id: trade-the-past-remove-dead-sso-scaffold-code
title: "Remove dead SSO scaffold code (PKCE, auth callback) left over from pre-API-key flow"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Overview

Remove three dead files left over from the original SSO/OAuth login scaffold that was replaced by the API key connection flow. The files are `src/lib/pkce.ts`, `src/lib/__tests__/pkce.test.ts`, and `src/app/auth/callback/page.tsx`. None are imported by production code. Also fix 2 unused-import lint warnings in `src/components/__tests__/ConnectEtoroModal.test.tsx`.

## Research notes

- `pkce.ts` exports 7 functions (generateState, generateCodeVerifier, generateCodeChallenge, storeAuthParams, getStoredState, getStoredCodeVerifier, clearAuthParams). Only imported by `pkce.test.ts`.
- `auth/callback/page.tsx` contains a single `redirect("/")` call. Not referenced from any component or link.
- `ConnectEtoroModal.test.tsx` has unused imports: `screen` from `@testing-library/react` and `ReactNode` from `react`.
- Removing these files requires no code changes elsewhere — verified via grep.

## Assumptions

- No planned future use of PKCE/OAuth — the initiative spec explicitly defers OAuth SSO.

## Architecture diagram

```mermaid
graph LR
    subgraph "Files to DELETE"
        A[src/lib/pkce.ts]
        B[src/lib/__tests__/pkce.test.ts]
        C[src/app/auth/callback/page.tsx]
    end
    subgraph "File to FIX lint"
        D[src/components/__tests__/ConnectEtoroModal.test.tsx]
    end
    subgraph "Unaffected auth flow"
        E[AuthProvider.tsx] --> F[/api/auth/etoro]
        E --> G[/api/auth/session]
        E --> H[/api/auth/logout]
    end
    A -.->|"not imported"| E
    C -.->|"not linked"| E
```

## One-week decision

**YES** — This is a ~15 minute task. Delete 3 files, remove 2 unused imports, verify tests and build.

## Implementation plan

1. Delete `src/lib/pkce.ts`
2. Delete `src/lib/__tests__/pkce.test.ts`
3. Delete `src/app/auth/callback/` directory
4. Remove unused `screen` import from `ConnectEtoroModal.test.tsx`
5. Remove unused `ReactNode` import from `ConnectEtoroModal.test.tsx`
6. Run `npm test` to verify all remaining tests pass
7. Run `npm run build` to verify `/auth/callback` is gone from route list
8. Grep for `pkce` and `auth/callback` to confirm no remaining references

## Problem statement

The codebase still contains dead code from the original SSO/OAuth login scaffold that was replaced by the API key connection flow in initiative 0002:

1. **`src/lib/pkce.ts`** — PKCE flow utilities (generateState, generateCodeVerifier, generateCodeChallenge, sessionStorage helpers). Not imported by any production code — only by its own test file.
2. **`src/lib/__tests__/pkce.test.ts`** — Tests for the dead PKCE module.
3. **`src/app/auth/callback/page.tsx`** — OAuth callback route that just redirects to `/`. Not referenced from anywhere.

This dead code:
- Adds an unnecessary route (`/auth/callback`) to the app's surface area
- Contains sessionStorage references (PKCE stores `etoro_sso_state` and `etoro_sso_code_verifier`) that are never used
- Could confuse future developers about the actual auth flow (API key via httpOnly cookie)

## User story

As a developer maintaining this production app, I want dead authentication code removed so that the codebase accurately reflects the current API key auth flow and has minimal attack surface.

## How it was found

During surface-sweep review, searched for SSO/OAuth references in the codebase. Found `pkce.ts` is only imported by its test file, `auth/callback/page.tsx` is not referenced from anywhere, and neither is used by the current API key connection flow.

## Proposed UX

No user-facing changes. Internal cleanup only.

## Acceptance criteria

- [ ] `src/lib/pkce.ts` is deleted
- [ ] `src/lib/__tests__/pkce.test.ts` is deleted
- [ ] `src/app/auth/callback/page.tsx` (and its directory) is deleted
- [ ] No references to PKCE, code_verifier, or auth/callback remain in production code
- [ ] All existing tests still pass (210 tests)
- [ ] Build succeeds with no new errors
- [ ] The `/auth/callback` route no longer appears in the build output

## Verification

- Run `npm test` — all tests pass
- Run `npm run build` — no `/auth/callback` in route list
- Grep for `pkce` and `auth/callback` — no remaining references

## Out of scope

- Renaming `LoginButton.tsx` to `ConnectButton.tsx` (the component works correctly, naming is cosmetic)
- Removing other unused code outside the SSO scaffold

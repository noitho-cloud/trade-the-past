---
id: trade-the-past-fix-login-button-onclick-type-error
title: "Fix LoginButton onClick type error that breaks production build"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem Statement

`npm run build` fails with a TypeScript error in `LoginButton.tsx`. The `openConnectModal` function signature was changed to `(pendingAction?: () => void) => void` (when the "resume pending action after connect" feature was added), but `LoginButton.tsx` still passes it directly as an `onClick` handler. The `onClick` handler passes a `MouseEvent` as the first argument, which is not assignable to `(() => void) | undefined`.

```
./src/components/LoginButton.tsx:39:7
Type error: Type '(pendingAction?: (() => void) | undefined) => void' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'.
```

All 283 tests pass, but the production build fails, meaning the app cannot be deployed.

## How It Was Found

Running `npm run build` during error-handling review produced a TypeScript compilation error. This is a regression from the iteration that added the `pendingAction` parameter to `openConnectModal`.

## User Story

As a developer, I want the production build to succeed so that the app can be deployed to Vercel.

## Proposed Fix

Change `onClick={openConnectModal}` to `onClick={() => openConnectModal()}` in `LoginButton.tsx` (line 39). This wraps the call in an arrow function so the `MouseEvent` is not passed as the `pendingAction` parameter.

## Acceptance Criteria

- [ ] `npm run build` passes without TypeScript errors
- [ ] All tests continue to pass
- [ ] The "Connect eToro" button in the header still opens the connect modal when clicked

## Verification

Run `npm run build` and `npm test` to confirm both pass.

## Out of Scope

- Changing the `openConnectModal` function signature
- Adding any new functionality

## Planning

### Overview

Trivial one-line fix: wrap `openConnectModal` in an arrow function when used as an `onClick` handler so that the `MouseEvent` argument is not forwarded as the optional `pendingAction` callback parameter.

### Research Notes

- `openConnectModal` signature: `(pendingAction?: () => void) => void` (defined in `AuthProvider.tsx`)
- React `onClick` handler signature: `MouseEventHandler<HTMLButtonElement>` = `(event: MouseEvent<HTMLButtonElement>) => void`
- When passed directly as `onClick={openConnectModal}`, TypeScript correctly reports that `MouseEvent` is not assignable to `() => void`
- Other callers (in `AffectedAssets.tsx` and `AuthProvider.test.tsx`) already use the arrow function pattern: `() => openConnectModal()` or `() => openConnectModal(() => { ... })`

### Architecture Diagram

```mermaid
graph LR
    A[LoginButton onClick] -->|wraps in arrow fn| B[openConnectModal]
    B --> C[AuthProvider sets showConnectModal=true]
```

### One-Week Decision

**YES** — this is a single-character-level change. Estimated effort: 2 minutes.

### Implementation Plan

1. Change `onClick={openConnectModal}` to `onClick={() => openConnectModal()}` in `LoginButton.tsx` line 39
2. Verify `npm run build` succeeds
3. Verify `npm test` still passes

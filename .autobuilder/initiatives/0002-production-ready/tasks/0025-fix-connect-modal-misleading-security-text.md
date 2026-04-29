---
id: trade-the-past-fix-connect-modal-misleading-security-text
title: "Fix misleading security claim in Connect eToro modal"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem statement

The Connect eToro modal displays the text: "Your keys are encrypted and stored securely. They are never sent to our servers or stored in your browser."

This statement is factually incorrect. The keys ARE sent to the server via `POST /api/auth/etoro`, where they are encrypted and stored in an httpOnly cookie. The cookie IS stored in the browser (it's just not accessible via JavaScript). The current wording could erode user trust if a user inspects network requests and sees their keys being transmitted to the server.

## User story

As a trader connecting my eToro account, I want accurate information about how my API keys are handled, so that I can trust the platform's security claims.

## How it was found

Observed during browser review of the Connect eToro modal. The modal text at `src/components/ConnectEtoroModal.tsx:141` claims keys are "never sent to our servers" but the `handleSubmit` function sends them to `POST /api/auth/etoro`. Confirmed by reviewing the auth route which receives, encrypts, and stores them in a cookie.

## Proposed UX

Replace the misleading text with an accurate description of the security model:

"Your keys are encrypted server-side and stored in a secure cookie. They are never exposed to client-side code or stored in localStorage."

This is truthful: keys are encrypted with AES-256-GCM, stored in an httpOnly cookie (not readable by JavaScript), and never placed in localStorage or any client-accessible storage.

## Acceptance criteria

- [ ] The security disclaimer text in `ConnectEtoroModal.tsx` accurately describes the key storage mechanism
- [ ] The text does NOT claim keys are "never sent to our servers" (they are, for encryption)
- [ ] The text does NOT claim keys are "not stored in your browser" (they are, in an httpOnly cookie)
- [ ] The updated text mentions encryption and httpOnly cookie security
- [ ] All existing tests pass
- [ ] Verify in browser with agent-browser that the modal shows the corrected text

## Out of scope

- Changing the actual key storage mechanism
- Adding client-side encryption before transmission
- Changing the auth API route logic

---

## Planning

### Overview

Single-line text change in `ConnectEtoroModal.tsx` to replace a misleading security claim with an accurate description of the key storage mechanism. The actual security implementation (AES-256-GCM encryption, httpOnly cookies) is correct — only the user-facing description is wrong.

### Research notes

- Keys are sent to `POST /api/auth/etoro` in the request body
- Server encrypts with AES-256-GCM via `encryptKeys()` in `src/lib/auth.ts`
- Encrypted keys stored in `ttp_etoro_keys` httpOnly cookie with `secure: true` in production
- Cookie IS stored in the browser but is NOT accessible via JavaScript (httpOnly)
- Current text: "They are never sent to our servers or stored in your browser" — both claims are inaccurate

### Assumptions

None — the behavior is clear from code inspection.

### Architecture diagram

```mermaid
graph LR
    A[ConnectEtoroModal] -->|POST apiKey, userKey| B[/api/auth/etoro]
    B -->|encrypt| C[encryptKeys - AES-256-GCM]
    C -->|set httpOnly cookie| D[Browser Cookie Store]
    D -->|auto-sent on requests| B
```

### One-week decision

**YES** — This is a single line text change in one file. Estimated: <5 minutes.

### Implementation plan

1. Update the disclaimer text at line 141 of `src/components/ConnectEtoroModal.tsx`
2. Update any related test that checks for the old text
3. Run tests to confirm nothing breaks
4. Verify in browser with screenshot

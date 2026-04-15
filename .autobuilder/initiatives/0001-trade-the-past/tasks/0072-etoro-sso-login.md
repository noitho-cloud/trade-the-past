---
id: trade-the-past-etoro-sso-login
title: "Implement eToro SSO Login with OAuth 2.0 Authorization Code + PKCE"
parent: trade-the-past
deps: [trade-the-past-fix-mobile-cards-trade-button]
split: false
depth: 1
planned: true
executed: false
---

## Problem statement

The app has no authentication. Trade and Watchlist buttons link to eToro but the user cannot log in with their eToro account. The product owner requires a full eToro SSO integration using OAuth 2.0 Authorization Code + PKCE flow.

## User story

As a trader, I want to log in with my eToro account so that Trade and Watchlist actions use my real eToro credentials, and the app feels connected to my trading platform.

## How it was found

Direct product owner feedback (CRITICAL priority). Full specification provided.

## Proposed UX

### Header: "Login with eToro" button
- Add "Login with eToro" button in the header, next to the dark mode toggle
- Green outlined pill button, matching eToro design system
- On click: initiates OAuth 2.0 + PKCE flow

### When logged in
- Replace "Login with eToro" button with user avatar/icon and "Connected to eToro" indicator
- Trade and Watchlist buttons become functional
- If NOT logged in, Trade/Watchlist buttons show "Login to trade" prompt

### Callback page (/auth/callback)
- Handles the OAuth redirect
- Shows loading spinner during token exchange
- On success: redirects to home
- On failure: shows error message with retry option

## Implementation details

### Frontend: PKCE flow
1. Generate `state` (128+ bits entropy, crypto.getRandomValues)
2. Generate `code_verifier` (43-128 chars, [A-Za-z0-9-._~])
3. Store state + code_verifier in sessionStorage
4. Create code_challenge = base64url(SHA-256(code_verifier)), method S256
5. Redirect to: https://www.etoro.com/sso with params: client_id, redirect_uri, response_type=code, scope=openid, state, code_challenge, code_challenge_method=S256

### Frontend: Callback page (/auth/callback)
1. Extract `code` and `state` from URL query params
2. Validate `state` matches sessionStorage — STOP if mismatch
3. POST to backend /api/auth/etoro with { code, code_verifier }
4. On success: store session token, redirect home, show user as logged in
5. On failure: show error

### Backend: /api/auth/etoro (Next.js API Route)
1. Receive { code, code_verifier } from frontend
2. Exchange code with eToro:
   - POST https://www.etoro.com/api/sso/v1/token
   - Content-Type: application/x-www-form-urlencoded
   - Body: client_id, client_secret, grant_type=authorization_code, redirect_uri, code, code_verifier
3. Receive id_token (+ optionally access_token, refresh_token)

### Backend: ID Token Validation (MANDATORY)
1. Fetch JWKS from https://www.etoro.com/.well-known/jwks.json
2. Validate JWT signature using JWKS
3. Validate claims: iss="https://www.etoro.com", aud=client_id, exp in future, iat reasonable
4. Extract `sub` = eToro User ID

### Session Management
- Create httpOnly cookie with session ID
- Store eToro access_token and refresh_token server-side (in-memory Map)
- NEVER store tokens in localStorage or client-readable JWT
- Implement refresh: POST with grant_type=refresh_token when access_token expires (10 min)

### Environment Variables
- ETORO_SSO_CLIENT_ID (already in .env)
- ETORO_SSO_CLIENT_SECRET (already in .env)
- ETORO_SSO_REDIRECT_URI (already in .env)

## Security Rules (non-negotiable)
- state validation REQUIRED
- PKCE REQUIRED (S256)
- Token exchange MUST be backend-only
- ID token MUST be validated cryptographically via JWKS
- Never trust frontend-decoded JWTs
- Never skip iss or aud checks
- httpOnly session cookies only

## Acceptance criteria

- [ ] "Login with eToro" button visible in header next to dark mode toggle
- [ ] Clicking "Login with eToro" generates state + code_verifier, stores in sessionStorage, redirects to eToro SSO
- [ ] /auth/callback page extracts code + state, validates state, calls backend
- [ ] Backend /api/auth/etoro exchanges code for tokens, validates id_token via JWKS
- [ ] Session cookie created on successful login
- [ ] User appears logged in after redirect (avatar/icon replaces login button)
- [ ] "Connected to eToro" indicator shown when logged in
- [ ] Trade/Watchlist buttons show "Login to trade" when not logged in
- [ ] Tokens stored server-side only (not in localStorage)
- [ ] All tests pass
- [ ] Build succeeds

## Verification

1. Run `npx vitest run` — all tests pass
2. Run `npx next build` — build succeeds
3. Visual check: login button appears in header
4. OAuth flow can be initiated (will redirect to eToro SSO)

## Overview

Full OAuth 2.0 Authorization Code + PKCE integration with eToro SSO. Creates 7 new files and modifies 2 existing files. Uses `jose` library for JWKS/JWT validation. Session management via httpOnly cookies with server-side token storage.

## Research notes

- Next.js 16 App Router: API routes go in `src/app/api/auth/etoro/route.ts`
- Callback page: `src/app/auth/callback/page.tsx` (client component for URL param extraction)
- `jose` npm package for JWKS fetching and JWT verification (well-maintained, 0 deps)
- Web Crypto API available in both browser (PKCE) and Node.js (session IDs)
- Next.js `cookies()` from `next/headers` for httpOnly cookie management
- In-memory Map for session store (sufficient for MVP, no DB needed)

## Assumptions

- eToro SSO endpoints are live and accept the provided client_id/secret
- No real testing against eToro endpoints (placeholder credentials in .env)
- Session store is in-memory (lost on server restart — acceptable for MVP)

## Architecture diagram

```mermaid
graph TD
    subgraph Frontend
        A[LoginButton component] -->|click| B[Generate state + PKCE]
        B -->|redirect| C[eToro SSO /sso]
        C -->|redirect back| D[/auth/callback page]
        D -->|POST code + verifier| E[/api/auth/etoro]
        F[AuthProvider context] -->|provides| G[isLoggedIn + user]
        G --> H[Header shows avatar or login]
        G --> I[AffectedAssets: conditional CTAs]
    end
    
    subgraph Backend
        E -->|exchange code| J[eToro Token Endpoint]
        J -->|id_token| K[Validate JWT via JWKS]
        K -->|valid| L[Create session]
        L -->|httpOnly cookie| D
        M[Session Store - in-memory Map] --> L
        N[/api/auth/session route] -->|check session| F
    end
```

## One-week decision

**YES** — Approximately 3-4 days of work. Standard OAuth 2.0 + PKCE pattern with well-established libraries. No novel challenges.

## Implementation plan

### Phase 1: Install dependencies
1. `npm install jose` for JWT/JWKS validation

### Phase 2: Auth utilities (lib/auth.ts)
1. PKCE helpers: generateState, generateCodeVerifier, generateCodeChallenge
2. Session store: in-memory Map with create/get/delete/cleanup
3. Token validation: validateIdToken using jose's jwtVerify + createRemoteJWKSet
4. Constants: SSO endpoints, client config from env

### Phase 3: Backend API routes
1. `src/app/api/auth/etoro/route.ts` — POST handler: exchange code, validate id_token, create session, set cookie
2. `src/app/api/auth/session/route.ts` — GET handler: check if session exists, return user info
3. `src/app/api/auth/logout/route.ts` — POST handler: destroy session, clear cookie

### Phase 4: Frontend auth context
1. `src/components/AuthProvider.tsx` — React context providing isLoggedIn, user, login(), logout()
2. Wraps children in layout.tsx
3. Checks /api/auth/session on mount to restore session

### Phase 5: Login button component
1. `src/components/LoginButton.tsx` — "Login with eToro" button
2. On click: generate state + PKCE, store in sessionStorage, redirect to eToro SSO
3. When logged in: show user icon + "Connected to eToro"

### Phase 6: Callback page
1. `src/app/auth/callback/page.tsx` — client component
2. Extract code + state from URL params
3. Validate state against sessionStorage
4. POST to /api/auth/etoro
5. On success: redirect to /
6. On error: show error message

### Phase 7: Wire up header + AffectedAssets
1. Add LoginButton to layout.tsx header (next to ThemeToggle)
2. Modify AffectedAssets trade/watchlist buttons: show "Login to trade" if not logged in

### Phase 8: Tests + Verification
1. Unit tests for PKCE helpers
2. Unit tests for session store
3. Build verification
4. All existing tests still pass

## Out of scope

- Actual eToro API calls for trading (deferred)
- Refresh token auto-renewal (basic implementation only)
- User profile fetching from eToro
- Database persistence of sessions (in-memory only for MVP)

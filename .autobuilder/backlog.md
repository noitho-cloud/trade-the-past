## Feedback (URGENT — Responsive layout broken)

### Fix responsive layout for desktop and mobile NOW
- Test the app at 375px (mobile) and 1280px (desktop) — fix everything that's broken
- **Mobile (375px):**
  - All cards must be full width, single column, no overflow
  - Affected asset cards on detail page must stack vertically (not side by side)
  - "Trade" and "Watchlist" buttons full width on mobile
  - Market reaction table must not overflow — use horizontal scroll if needed
  - Header: logo left, dark mode toggle right, compact
  - No horizontal scroll anywhere on the page
  - Touch targets minimum 44px
- **Desktop (1280px):**
  - Content centered with max-width 720px
  - Affected asset cards can be 2-3 per row with grid/flexbox
  - Generous whitespace and padding
  - Cards should have breathing room between them
- **Both:**
  - Images must be max-width: 100%, height auto
  - Font sizes should use clamp() for smooth scaling
  - The scope toggle and header must not break at any width
  - Footer stacks cleanly on mobile
  - Test at 320px, 375px, 768px, 1024px, 1280px — no breakage at any width

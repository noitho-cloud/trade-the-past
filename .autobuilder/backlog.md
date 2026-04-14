## Feedback (URGENT — FULL eToro DESIGN SYSTEM ALIGNMENT)

### Restyle EVERYTHING to pixel-match eToro's design system
- Read constraints.md carefully — it has the COMPLETE spec for every component
- This is not a light touch-up — rebuild the CSS from scratch using eToro tokens
- Implement ALL design tokens as CSS custom properties (--etoro-green, --navy, --gray-bg, etc.)
- Load eToro Variable font from CDN, with eToro Numbers variant for market data
- Every component must match:
  - **Header:** 56px, white/navy bg, logo left, toggles right, bottom border
  - **Cards:** 16px radius, 24px padding, eToro shadow, hover lift effect
  - **Buttons:** Green pill (48px radius) for "Trade", white outlined pill for "Watchlist"
  - **Badges:** Pill-shaped, color-coded per event type (see constraints.md for exact colors)
  - **Tables:** Clean rows, subtle striping, uppercase headers, right-aligned numbers in green/red
  - **Scope toggle:** eToro segmented control style — pill container, white active segment
  - **Dark mode:** Full dark mode with user toggle (sun/moon icon), localStorage persistence
  - **Responsive:** Mobile-first, 720px max-width desktop, sticky CTAs on mobile
  - **Transitions:** 150ms ease on hovers, card lift, button press scale
- Use CSS custom properties EVERYWHERE — no hardcoded hex in components
- The app must look like it was built by eToro's product team

### Only show assets tradeable on eToro
- Remove "10Y Treasury", "USD Index", individual bonds
- Only: stocks, indices, commodities, crypto, forex

## Feedback (URGENT — RESTYLE ENTIRE APP)

### Restyle the entire app to match the eToro design system
- Read constraints.md for the full token reference
- Load the eToro Variable font from CDN (see constraints.md for @font-face)
- Replace ALL colors with eToro tokens: green #0EB12E, navy #000021, red #E31937, gray-bg #F5F5F5
- Replace ALL buttons with eToro pill-shaped buttons (48px radius, green primary, white secondary)
- Replace ALL cards with eToro card style (16px radius, 24px padding, subtle shadow)
- Replace ALL badges with eToro badge style (fully round, 12px/600 weight)
- Market data: green for gains, red for losses — use eToro green/red specifically
- "Trade" button = green pill (eToro primary CTA style), "Watchlist" = white outlined pill
- Page background: #F5F5F5
- The app should look like it belongs inside the eToro platform
- This is higher priority than any functional changes — the visual identity must match eToro

### Only show assets tradeable on eToro
- Remove non-tradeable assets like "10Y Treasury", "USD Index"
- Only show assets users can trade on eToro (stocks, indices, commodities, crypto, forex)

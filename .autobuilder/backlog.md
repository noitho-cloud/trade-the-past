## Feedback (CRITICAL — FINAL POLISH BEFORE PRESENTATION)

This is the LAST round of changes before the app is presented. Every item must be fixed.

### 1. Fix "Watchlist" button style
- In LIGHT mode, the "Watchlist" button is dark/navy — WRONG
- It must be white background with #E5E5E5 border (secondary style)
- In DARK mode, it should be outlined with #2A2A4E border, transparent background
- "Trade" = green filled pill (correct), "Watchlist" = outlined pill (fix this)

### 2. Fix header in light mode
- The header is navy (#000021) in both light and dark mode
- In LIGHT mode: header should be WHITE background with navy text and a subtle bottom border (#E5E5E5)
- In DARK mode: header stays navy (#000021) — this is correct
- The dark mode toggle icon should match the header background

### 3. Unify historical matches into ONE insight
- The detail page still shows 2006 and 2019 as separate blocks
- Merge them into ONE unified narrative paragraph
- Example: "In similar past events — the 2006 Fed pause and the 2019 dovish pivot — markets rallied. The S&P 500 gained 1-4% in the following month, while gold and EUR/USD strengthened as the dollar weakened."
- Show ONE consolidated market reaction table (already exists, keep it)
- Remove the separate 2006 / 2019 blocks with individual descriptions
- ONE insight, not two stories

### 4. Remove the "10Y Treasury" and "USD Index" from ALL mock data
- These are NOT tradeable on eToro
- Scan every mock event and remove any asset that isn't tradeable on eToro
- Only keep: stocks (TSLA, AAPL, etc.), indices (S&P 500, Euro STOXX 50, etc.), commodities (Gold, Oil, Brent Crude, Natural Gas), crypto (BTC, ETH), forex (EUR/USD, GBP/USD)

### 5. Fix any hydration errors
- There was a React hydration error on the weekly view (WeeklyViewClient.tsx line 122)
- Fix the date formatting to be consistent between server and client
- No errors should appear in the console

### 6. Final visual polish
- Ensure consistent spacing between all sections
- Ensure the "Key Takeaway" box has strong visual hierarchy (green left border or green accent)
- Ensure all text is readable in both light and dark modes (check contrast)
- Ensure the scope toggle (Global / UK / DE / FR) uses the eToro segmented control style
- Footer disclaimer text should be subtle (#6B7280 in light, #8B8BA7 in dark)
- No layout shift on page load
- No broken images or missing placeholders

### 7. Ensure mobile looks presentation-ready
- Test at 375px width — everything must stack cleanly
- Cards should be full width on mobile
- Detail page readable on mobile with no overflow
- CTAs full width on mobile
- Footer stacks properly

---
id: trade-the-past-restyle-etoro-design-system
title: "Restyle entire app to match the eToro design system"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem Statement

The app currently uses a custom editorial design system (Geist + Playfair Display fonts, cream backgrounds, black accent buttons) that does not match the eToro design system defined in constraints.md. The product owner urgently requires the entire visual identity to match eToro — eToro Variable font, eToro green (#0EB12E) primary buttons, #F5F5F5 page background, pill-shaped CTAs, and eToro-specific market data colors.

Observed issues from browser review:
- Background is cream (#f8f6f3) instead of eToro gray (#F5F5F5)
- Font is Geist Sans + Playfair Display serif instead of eToro Variable
- All buttons are black with rounded corners instead of green pill-shaped
- "TODAY" badge uses black background instead of eToro green
- Event type badges use Tailwind semantic colors (amber, rose, violet, etc.) instead of eToro tokens
- Market reaction colors use Tailwind emerald/red instead of eToro green (#0EB12E) / red (#E31937)
- Cards lack the eToro shadow style
- "Trade" button is black instead of eToro green pill
- "Watchlist" button is outlined black instead of white outlined pill
- Key Takeaway box uses foreground/opacity colors instead of eToro navy accent
- Header and footer don't match eToro branding

## User Story

As a product owner, I want the app to look like it belongs inside the eToro platform, so that it maintains brand consistency and feels native to eToro users.

## How It Was Found

Direct user feedback (product owner) — highest priority. Confirmed by visual comparison of current app screenshots against eToro design system tokens in constraints.md.

## Proposed UX

Apply the complete eToro design system from constraints.md:

### Global CSS
- Load eToro Variable font via @font-face from CDN
- Set CSS custom properties for all eToro tokens (colors, spacing)
- Body background: #F5F5F5
- Font family: 'eToro', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- Remove Playfair Display and Geist font imports

### Header
- Navy (#000021) background, white text
- Logo in eToro font, weight 700

### Buttons
- Primary (Trade): #0EB12E fill, white text, 48px border-radius (pill), 48px height
- Hover: #0C9A27
- Secondary (Watchlist): white background, #E5E5E5 border, dark text, pill shape
- All CTAs: font-weight 600, 16px

### Cards
- White background, 16px border-radius, 24px padding
- Shadow: 0 0 13px rgba(0,0,0,0.08)

### Badges
- Event type: fully round radius, 12px/600, 4px 8px padding
- Use muted gray backgrounds for neutral event types
- "Today" badge: eToro green background, white text
- Bullish/Bearish direction badges: green/red with matching background tints

### Market Data
- Gains/Up: #0EB12E (eToro green)
- Losses/Down: #E31937 (eToro red)
- Replace all Tailwind emerald-*/red-* color classes

### Scope Toggle
- Pill-shaped toggle matching eToro style
- Active state: navy or green fill

### Footer
- Clean typography in eToro font
- Proper spacing per eToro tokens

### Key Takeaway
- eToro green left border accent
- Light green tinted background

## Acceptance Criteria

- [ ] eToro Variable font loaded from CDN and applied as primary font
- [ ] Playfair Display and Geist font imports removed
- [ ] Page background is #F5F5F5
- [ ] All primary buttons are green (#0EB12E) pill-shaped (48px radius)
- [ ] Trade button is green pill, Watchlist is white outlined pill
- [ ] All cards use 16px radius, 24px padding, eToro shadow
- [ ] All event type badges use fully round radius, 12px/600 weight
- [ ] Market data colors use exactly #0EB12E for gains and #E31937 for losses
- [ ] Header uses navy (#000021) background with white text
- [ ] Today badge uses eToro green background
- [ ] Direction badges (Bullish/Bearish) use eToro green/red
- [ ] No Tailwind semantic color classes (emerald-*, rose-*, violet-*, amber-*, etc.) remain in styling
- [ ] All tests pass
- [ ] Visual verification in browser confirms eToro look and feel

## Verification

- Run full test suite
- Open app in browser, screenshot landing and event detail pages
- Visually confirm eToro branding is consistent across all pages

## Out of Scope

- Changing app functionality or data flow
- Adding new features
- Modifying API endpoints

# Trade the Past

## What
A curated daily decision-support tool for traders. It detects major market-moving events from real news, matches them to similar historical events, shows how markets reacted, and provides a clear call to action to trade via eToro.

## Who
Active traders and self-directed investors on eToro who want signal over noise — people who care about what happened today and what it means based on history.

## Objectives
1. Surface high-impact market events daily from diverse real news sources
2. Match current events to historical parallels with market reaction data
3. Enable one-click trading and watchlist management via eToro
4. Deliver a polished, eToro-branded experience across mobile and desktop

## Design Language
- eToro design system: green (#0EB12E) primary CTAs, clean professional aesthetic
- Light mode (#F5F5F5 bg) and dark mode (#111111 bg) with user toggle
- CSS custom properties for all design tokens
- Responsive: mobile-first, adapts to desktop
- No emojis in UI

## Initiative History
- 0001-trade-the-past: MVP — news ingestion (RSS), event classification, historical matching (built-in DB + optional OpenAI), eToro design system, light/dark mode, responsive layout, Vercel deployment. 86 tasks completed.

## Project-wide Constraints
- Only show assets tradeable on eToro
- Trade/Watchlist CTAs must deep-link or execute via eToro APIs
- All API keys/secrets stored server-side only, never exposed to browser
- eToro design system tokens used everywhere — no hardcoded hex values in components

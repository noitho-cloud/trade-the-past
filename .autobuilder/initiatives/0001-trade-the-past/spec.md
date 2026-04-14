# Trade the Past — Product Spec

## Vision

A curated, daily decision-support tool for traders. Instead of a noisy news feed, it presents one major market-moving event per day, pairs it with similar historical events, shows how markets reacted, and ends with a clear call to action.

## Target Users

Active traders and self-directed investors who want signal over noise — people who care about what happened today and what it means based on history.

## Core Loop

1. **Detect** — Aggregate headlines from multiple news APIs, filter to high-impact market events only
2. **Match** — For the top event each day, find 1–3 similar past events using an LLM
3. **Analyze** — Show market reaction data for each historical match (direction, Day 1, Week 1 performance)
4. **Act** — End with a single, clear CTA ("View affected assets", "Trade now", or "Add to watchlist")

## Features

### News Ingestion
- Integrate 1–2 free/freemium news APIs (e.g. NewsAPI, GNews)
- Global sources + local sources for UK, Germany, France
- Aggregate and deduplicate headlines

### Event Detection
- Rule-based classification of high-impact event types:
  - Earnings reports
  - Layoffs / restructuring
  - Lawsuits / legal action
  - Regulation / policy changes
  - Interest rate decisions
  - Geopolitical events
  - Commodity shocks
- Score and rank events by impact
- Select 1 key event per day

### Historical Matching
- For each selected event, use an LLM to find 1–3 similar past events based on:
  - Event type
  - Company / sector
  - Geography
- Generate a short explanation of why the events are similar
- Include market reaction data (affected assets, direction, Day 1 / Week 1 performance)

### Frontend — Weekly View (Main Screen)
- Show "This Week" — last 7 days only
- Each day displays:
  - Event title
  - Event type badge
  - Small visual (news image or placeholder)
- No infinite scroll, no archive

### Frontend — Event Detail Screen
- Event headline + type badge
- Visual (image)
- "Similar past event" section with:
  - Historical event description
  - Market reaction table (asset, direction, Day 1, Week 1)
  - Short insight (1–2 sentences)
- Single prominent CTA at the bottom

### Scope Toggle
- Small toggle: Global / Local
- Local covers: UK, Germany, France
- No onboarding or required selection — defaults to Global

### Images
- Priority: original news image → stock/thematic placeholder
- No AI-generated images in MVP

## UX Principles
- No emojis
- No noisy feeds or infinite scroll
- No archive — only the current week
- Focus on clarity and speed
- One strong insight per event
- Always end with a clear action
- Editorial feel, not a news aggregator

## Non-Goals (MVP)
- User accounts or authentication
- Push notifications
- Real-time market data
- AI-generated images
- Deep-link broker integration
- Mobile native apps

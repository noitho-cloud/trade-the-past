---
id: trade-the-past-polish-interactive-states
title: "Polish hover states, micro-interactions, and entrance animations for cards and CTA"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem statement

Interactive feedback across the app is barely perceptible, making the UI feel flat and unresponsive:

1. **Event card hover** — The headline text changes to `text-foreground/80` on hover, which is *lighter* than the default — counterintuitive for an active state. The shadow change (`hover:shadow-sm`) is nearly invisible against the warm beige background.
2. **CTA button hover** — Only reduces opacity to 0.90, which is almost imperceptible. No color shift, no scale change, no visual pop.
3. **No entrance animations** — Cards appear instantly with no stagger or fade, making page loads feel abrupt rather than editorial.

## User story

As a trader navigating the app, I want clear visual feedback when I hover or interact with elements so that the interface feels responsive and polished.

## How it was found

Visual inspection with agent-browser during visual-polish review. Hover states were tested by examining the CSS classes in WeeklyViewClient.tsx and CTAButton.tsx. The `group-hover:text-foreground/80` on the card headline reduces contrast on hover.

## Proposed UX

**Event cards:**
- Remove the `group-hover:text-foreground/80` on the headline (it makes text lighter on hover).
- Increase hover shadow from `shadow-sm` to `shadow-md` with a slight Y-translate (`hover:-translate-y-0.5`).
- Add a subtle left-border accent on hover (2px, using the event type color).

**CTA button:**
- Add a visible hover state: slight scale-up (`hover:scale-[1.01]`), soften the black to `bg-foreground/90` with a transition.
- Add a focus-visible ring for keyboard accessibility.

**Entrance animations:**
- Stagger event cards on the weekly view with a subtle fade-in + slide-up (e.g., 50ms delay per card, 300ms duration).
- Use CSS animations (no JS animation library needed).

## Acceptance criteria

- [ ] Event card headline does NOT get lighter on hover
- [ ] Event card hover produces a visible elevation change (shadow + translate)
- [ ] CTA button hover state is clearly visible (not just 10% opacity change)
- [ ] CTA button has a focus-visible ring for keyboard users
- [ ] Event cards on the weekly view animate in with a staggered fade-in on initial load
- [ ] All transitions are smooth (200-300ms, ease-out)
- [ ] No janky layout shifts from the animations

## Verification

Run all tests. Open the weekly view in agent-browser, hover over cards to verify visual feedback. Click through to event detail, hover the CTA. Screenshot results.

## Overview

Fix counterintuitive hover states, add visible interactive feedback, and introduce subtle entrance animations for event cards. Changes touch `WeeklyViewClient.tsx`, `CTAButton.tsx`, and `globals.css`.

## Research notes

- The card hover class `group-hover:text-foreground/80` reduces text to 80% of foreground on hover — lighter, not darker
- The card shadow transition `hover:shadow-sm` is barely visible on the warm #f8f6f3 background
- CTA button only uses `hover:opacity-90` — nearly imperceptible
- CSS `@keyframes` are already used in `globals.css` for `fadeIn`
- Staggered animations can use CSS `animation-delay` with inline styles (no JS library needed)
- `prefers-reduced-motion` should be respected

## Assumptions

- Entrance animations use CSS only — no framer-motion or other animation libraries
- The stagger is applied via inline `style={{ animationDelay }}` in the map function
- Focus-visible styling uses Tailwind's `focus-visible:` variant

## Architecture diagram

```mermaid
graph TD
    subgraph Files to Edit
        WVC[WeeklyViewClient.tsx]
        CTA[CTAButton.tsx]
        CSS[globals.css]
    end

    CSS -->|@keyframes slideUp| WVC
    WVC -->|remove group-hover:text-foreground/80| WVC
    WVC -->|add hover:-translate-y-0.5 hover:shadow-md| WVC
    WVC -->|add staggered animation class| WVC
    CTA -->|add hover:scale, focus-visible ring| CTA
```

## One-week decision

**YES** — Pure CSS/className changes across 3 files. Scope is ~1-2 hours.

## Implementation plan

### Phase 1: Fix card hover states in WeeklyViewClient.tsx
- Remove `group-hover:text-foreground/80` from the h3 headline
- Replace `hover:shadow-sm` with `hover:shadow-md hover:-translate-y-0.5`
- Ensure transition classes cover transform (`transition-all` already present)

### Phase 2: Add staggered entrance animation
- Add a `@keyframes cardEnter` in `globals.css` (fade-in + slide-up from 8px)
- Add a `.card-enter` utility class with the animation
- Apply it to each card in the map with `animationDelay: index * 60ms`
- Add `@media (prefers-reduced-motion: reduce)` to disable

### Phase 3: Polish CTA button in CTAButton.tsx
- Replace `hover:opacity-90` with `hover:bg-foreground/85 hover:scale-[1.01]`
- Add `focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2`

### Phase 4: Verify
- Run tests, build, verify hover states and animations in browser

## Out of scope

- Page transition animations (route changes)
- Scroll-triggered animations

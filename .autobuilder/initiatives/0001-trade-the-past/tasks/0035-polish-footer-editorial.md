---
id: trade-the-past-polish-footer-editorial
title: "Polish footer with better typography hierarchy and editorial spacing"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: false
---

## Problem statement

The footer uses 10-11px text throughout with minimal visual hierarchy. The section headers
("HOW IT WORKS", "SOURCES") are in 10px uppercase tracking — the same visual weight as the
body text below them. The overall footer reads as legal fine-print rather than an intentional
editorial element. The footer is the last thing a user sees and should reinforce the product's
editorial quality.

## User story

As a visitor, I want the footer to feel like part of a polished editorial product, so that the
entire experience feels cohesive from top to bottom.

## How it was found

Visual-polish review: screenshots 64-landing-bottom.png and 66-event-detail-bottom.png show
the footer with very small, uniformly styled text. The section headings don't stand out from
their content, and the overall impression is of afterthought metadata.

## Proposed UX

- Increase section heading size from 10px to 11-12px and add font-serif for consistency
  with the rest of the product's editorial typography
- Increase body text from 11px to 12-13px for readability
- Add slightly more vertical spacing between the "How it works" and "Sources" sections
- Use the serif font for the section headers to match the editorial tone
- Keep the disclaimer text smaller and muted as it is (this is intentionally fine-print)
- Add a subtle "Trade the Past" wordmark or the brand name in the footer for identity

## Acceptance criteria

- [ ] Footer section headings use serif font and are visibly larger than body text
- [ ] Footer body text is at least 12px for readability
- [ ] Vertical spacing between sections is comfortable (not cramped)
- [ ] Disclaimer remains smaller and muted
- [ ] Footer includes the product name for brand reinforcement
- [ ] Overall footer feels like an editorial footer, not a legal block

## Verification

Run all tests. Verify in browser — screenshot the footer and confirm improved hierarchy.

## Out of scope

- Navigation links in footer
- Social media links
- Newsletter signup

---

## Planning

### Overview

Modify the footer section in `src/app/layout.tsx` (lines 65-96). The footer currently uses
`text-[10px]` for headings and `text-[11px]` for body text. Need to increase sizes, add
serif font to headings, improve spacing, and add brand name.

### Research notes

- Current footer structure: two sections (How it works, Sources) + disclaimer
- Heading style: `text-[10px] font-semibold tracking-widest uppercase text-muted/70`
- Body style: `text-[11px] text-muted leading-relaxed`
- The app uses Playfair Display as `font-serif` — using it for footer headings will
  match the editorial tone of the rest of the app.
- Professional editorial footers (NYT, Bloomberg, The Economist) use 12-13px body text
  and clearly differentiated headings.

### Assumptions

- The footer is rendered in `layout.tsx` which is a server component — no client-side concerns.
- The disclaimer text should remain small and visually de-emphasized (it's legal fine-print).

### Architecture diagram

```mermaid
graph TD
  A[layout.tsx footer] --> B[How it works section]
  A --> C[Sources section]
  A --> D[Disclaimer]
  A --> E[Add: Brand name wordmark]
  B --> F[Upgrade heading: font-serif text-xs]
  B --> G[Upgrade body: text-xs from text-11px]
  C --> F
  C --> G
  D --> H[Keep small: text-[11px]]
  E --> I[Trade the Past in serif font]
```

### One-week decision

**YES** — Single-file JSX/class changes in the footer. Under 30 minutes of work.

### Implementation plan

1. Upgrade footer section headings from `text-[10px]` to `text-xs` (12px) and add `font-serif`
2. Upgrade body text from `text-[11px]` to `text-xs` (12px)
3. Increase spacing between sections from `space-y-4` to `space-y-5`
4. Add product brand name "Trade the Past" above the sections, using `font-serif`
5. Increase disclaimer from `text-[10px]` to `text-[11px]` for minimum readability
6. Verify the footer looks editorially polished

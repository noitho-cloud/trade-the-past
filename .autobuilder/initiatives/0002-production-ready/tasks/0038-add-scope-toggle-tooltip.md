---
id: trade-the-past-add-scope-toggle-tooltip
title: "Add tooltip to scope toggle explaining what Global vs UK/DE/FR filters"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem statement

The scope toggle on the weekly view shows "Global" and "UK / DE / FR" buttons but provides no explanation of what switching does. A first-time user has no way to know whether this filters by news region, market, or language without clicking it and hoping the change is obvious.

## User story

As a first-time user, I want to understand what the scope toggle does before clicking it, so that I can choose the right filter for my interests.

## How it was found

Fresh-eyes browser review (iteration #32). Landed on the weekly view and saw the toggle but had no idea what it controlled. The label "UK / DE / FR" suggests countries but doesn't explain the filtering behavior. Screenshot evidence: `review-screenshots/184-how-it-works.png`.

## Proposed UX

Add a native `title` attribute to the toggle container or each button:
- Global button: title="Show worldwide market events"
- UK/DE/FR button: title="Show events for UK, Germany, and France markets"

This is lightweight — no new UI elements, just a hover tooltip using the browser's native title behavior.

## Acceptance criteria

- [ ] Global button has a title attribute explaining it shows worldwide events
- [ ] UK/DE/FR button has a title attribute explaining it shows regional events
- [ ] Tooltips are visible on hover (desktop)
- [ ] Existing ScopeToggle tests still pass

## Verification

- Run all tests: `npm test`
- Open http://localhost:3050 in agent-browser, hover over scope toggle buttons, verify tooltip text
- Take a screenshot as evidence

## Out of scope

- Custom tooltip components or animations
- Changing the scope toggle labels themselves
- Adding mobile-specific tooltip behavior

---

## Planning

### Research notes

- The `ScopeToggle` component lives in `src/components/ScopeToggle.tsx` (41 lines).
- It renders two `<button>` elements: "Global" and "UK / DE / FR".
- Neither button has a `title` attribute.
- Existing tests are in `src/components/__tests__/ScopeToggle.test.tsx`.

### Architecture diagram

```mermaid
graph LR
  A[ScopeToggle] --> B[Global button]
  A --> C[UK/DE/FR button]
  B --> D[title="Show worldwide market events"]
  C --> E[title="Show events for UK, Germany, and France"]
  style D fill:#e8f5e9,stroke:#0eb12e
  style E fill:#e8f5e9,stroke:#0eb12e
```

### One-week decision

**YES** — Adding two `title` attributes to existing buttons. Under 10 minutes of work.

### Implementation plan

1. In `ScopeToggle.tsx`, add `title` attributes to each button:
   - Global button: `title="Worldwide market events"`
   - UK/DE/FR button: `title="UK, Germany, and France market events"`
2. Run tests to verify nothing breaks.
3. Verify visually in browser by hovering over the buttons.

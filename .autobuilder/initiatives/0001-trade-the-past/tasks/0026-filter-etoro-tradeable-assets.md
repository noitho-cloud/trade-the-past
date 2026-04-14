---
id: trade-the-past-filter-etoro-tradeable-assets
title: "Only show assets that are tradeable on eToro"
parent: trade-the-past
deps: []
split: false
depth: 1
planned: true
executed: true
---

## Problem Statement

The app displays assets that are not tradeable on eToro's platform. Users clicking "Trade" on these assets are sent to broken/nonexistent eToro pages. Non-tradeable assets observed in the live app:

- **10Y Treasury** — bonds not tradeable on eToro (Fed rates event)
- **USD Index** — not available on eToro (Fed rates event)
- **UK 10Y Gilt** — bonds not tradeable on eToro (BoE event)
- **STOXX 600 Tech** — sector sub-index, not directly tradeable (EU AI regulation event)
- **Euro STOXX Banks** — sector sub-index, not directly tradeable (Deutsche Bank event)
- **Lynas Rare Earths** — Australian mining stock, not on eToro (China rare earths event)
- **Toyota Motor** — not confirmed on eToro (China rare earths event)
- **USD/CNY** — not a tradeable pair on eToro (China rare earths event)
- **S&P 500 Energy** — sector sub-index, not directly tradeable (OPEC event)
- **Airlines ETF (JETS)** — not confirmed on eToro (OPEC event)
- **European Natural Gas** — ambiguous, may map to natural gas commodity

These appear in: weekly view key reaction indicators, market reaction tables, and affected assets cards with Trade/Watchlist CTAs.

## User Story

As a trader using this app, I want to only see assets I can actually trade on eToro, so that clicking "Trade" or "Watchlist" takes me to a valid eToro instrument page.

## How It Was Found

Direct feedback from product owner. Confirmed by browsing the live app — multiple events display non-tradeable assets with Trade CTAs that link to nonexistent eToro pages.

## Proposed UX

1. **Mock data**: Replace all non-tradeable assets with eToro-tradeable alternatives
2. **LLM prompt**: Add explicit instruction to only include eToro-tradeable assets (stocks, ETFs, indices, commodities, crypto, forex pairs that exist on eToro)
3. **Runtime filter**: Add a whitelist-based filter that strips non-tradeable assets from reactions before display, as a safety net for both mock and LLM-generated data
4. **Edge case**: If all assets for an event are non-tradeable, still show the insight text but hide the Affected Assets section (it already handles empty arrays gracefully)
5. **Key reaction on cards**: If the first reaction asset is non-tradeable, fall through to the next tradeable one

## Acceptance Criteria

- [ ] No "10Y Treasury", "USD Index", "UK 10Y Gilt" appear anywhere in the UI
- [ ] No "Lynas Rare Earths", "Toyota Motor", "USD/CNY" appear anywhere in the UI
- [ ] No "STOXX 600 Tech", "Euro STOXX Banks", "S&P 500 Energy" appear anywhere in the UI
- [ ] Mock data reactions only reference eToro-tradeable assets
- [ ] LLM prompt explicitly instructs to use only eToro-tradeable instruments
- [ ] A runtime filter (whitelist or slug validation) strips any non-tradeable asset from reactions
- [ ] Weekly view cards only show tradeable assets in key reaction indicators
- [ ] Event detail market reaction table only shows tradeable assets
- [ ] Event detail affected assets section only shows tradeable asset cards
- [ ] Events with zero tradeable assets after filtering still show the historical insight (just no affected assets section)
- [ ] etoro-slugs.ts only maps tradeable assets and exports an `isEtoroTradeable` utility

## Verification

- Run all tests and verify they pass
- Browse every event in the app with agent-browser and confirm no non-tradeable assets appear
- Take screenshots as evidence

## Out of Scope

- Adding new asset types or instruments
- Real-time validation against eToro API for tradeability
- Changing the visual design of asset cards

## Research Notes

- eToro tradeable instrument types: stocks (US, EU), ETFs, indices (SPX500, UK100, DAX, CAC40, EUSTX50), commodities (gold, oil, natural gas), crypto (BTC, ETH), forex pairs (EUR/USD, GBP/USD, USD/JPY — but NOT USD/CNY)
- Bonds (10Y Treasury, UK 10Y Gilt) are NOT tradeable on eToro
- Sector sub-indices (S&P 500 Energy, STOXX 600 Tech, Euro STOXX Banks) are not directly tradeable — use the broader index or individual stocks instead
- Lynas Rare Earths (Australian) and Toyota Motor (Japanese) are not available on eToro
- USD Index (DXY) is not available as a tradeable instrument on eToro
- Airlines ETF (JETS) is not confirmed on eToro — replace with individual airline stocks or broader ETFs

## Assumptions

- The existing etoro-slugs.ts ASSET_TO_SLUG map defines the canonical set of tradeable assets
- Non-tradeable assets in mock data should be replaced with appropriate eToro-tradeable alternatives, not simply removed (to maintain event quality)
- The LLM prompt update is a best-effort instruction — the runtime filter is the safety net

## Architecture Diagram

```mermaid
graph TB
    subgraph Data Sources
        MOCK[Mock Data<br/>mock-data.ts]
        LLM[LLM Response<br/>openai-client.ts]
    end

    subgraph Filter Layer
        SLUGS[etoro-slugs.ts<br/>ASSET_TO_SLUG whitelist<br/>+ isEtoroTradeable()]
        FILTER[filterTradeableReactions()<br/>strips non-tradeable from reactions]
    end

    subgraph Consumers
        UI_TABLE[MarketReactionTable<br/>in UnifiedInsight]
        UI_ASSETS[AffectedAssets<br/>asset cards + CTAs]
        UI_CARD[WeeklyViewClient<br/>keyReaction indicator]
    end

    MOCK -->|reactions[]| FILTER
    LLM -->|reactions[]| FILTER
    SLUGS -->|whitelist check| FILTER
    FILTER -->|filtered reactions| UI_TABLE
    FILTER -->|filtered reactions| UI_ASSETS
    FILTER -->|first tradeable| UI_CARD
```

## One-Week Decision

**YES** — This is a focused data-layer change touching 4 files (etoro-slugs.ts, mock-data.ts, historical-prompt.ts, event-service.ts) plus minor filtering in component consumers. No new architecture, no new dependencies. Estimated at 1-2 hours.

## Implementation Plan

### Phase 1: Define tradeable whitelist (etoro-slugs.ts)
- Export `isEtoroTradeable(assetName)` that checks against the ASSET_TO_SLUG keys
- Remove non-tradeable entries from ASSET_TO_SLUG (10Y Treasury, USD Index, UK 10Y Gilt, Lynas Rare Earths, Toyota Motor, USD/CNY, S&P 500 Energy, STOXX 600 Tech, Euro STOXX Banks, Airlines ETF)
- Export a `filterTradeableReactions()` utility that filters MarketReaction arrays

### Phase 2: Fix mock data (mock-data.ts)
- Replace non-tradeable assets in each event's reactions with eToro-tradeable alternatives
- Ensure keyReaction selection in getMockEvents picks a tradeable asset

### Phase 3: Update LLM prompt (historical-prompt.ts)
- Add explicit instruction: "Only include assets tradeable on eToro (stocks, ETFs, major indices, commodities, crypto, major forex pairs). Do NOT include bonds, sector sub-indices, or exotic instruments."
- Provide examples of tradeable vs non-tradeable

### Phase 4: Add runtime filter (event-service.ts + components)
- Filter reactions through `filterTradeableReactions()` before returning from getEventById and getMockEventById
- Apply filter in getMockEvents for keyReaction selection
- Components already handle empty reactions gracefully

# URGENT — Still showing non-English articles + event diversity

## Issue 1: Non-English articles still appearing
The Arabic source suffix "المتداول العربي" is still showing in production. Task 0032 was executed but either:
- The source suffix stripping doesn't catch Arabic text
- The non-Latin character filter isn't strict enough
- Vercel cache is stale

Fix: Ensure the non-English filter catches ALL non-Latin characters in title AND source fields. Force redeploy.

## Issue 2: Event type diversity still poor
8 out of 10 events are "interest-rates". The feed needs better diversity:
- Max 3-4 events of the same type out of 10
- Actively seek earnings, layoffs, commodity shocks, geopolitical events
- The classifier/diversity selector from initiative 0001 may have been overwritten — verify `selectDiverseEvents` still has the `maxPerType` cap

## Priority
CRITICAL — both are user-visible quality issues.

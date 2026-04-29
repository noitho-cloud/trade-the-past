# URGENT — Filter non-English articles from news feed

## Problem
The news feed is showing articles in Arabic, Chinese, and other languages mixed with English content. Example: "المتداول العربي" and "富途牛牛" appear in event titles. This looks broken and unprofessional.

## Required Fix
1. **Immediate**: Filter out non-English articles in the RSS/news pipeline. Detect language by checking if the title/summary contains non-Latin characters (Arabic, Chinese, Japanese, Korean, Cyrillic, etc.). Drop those articles before classification.
2. **RSS feed cleanup**: Only use English-language RSS feeds. Remove or replace any feeds that return non-English content. Google News search feeds should explicitly use `&hl=en&gl=us` parameters.
3. **Source suffix cleanup**: Titles still show source suffixes like "- Finance Colombia", "- 富途牛牛". Strip these completely.

## Priority
CRITICAL — the app looks broken with mixed languages.

---

# FEATURE — User language preference from eToro

## Problem
After a user connects their eToro account, the app should detect their preferred language and offer translated content.

## Required
- After API key connection, fetch user profile/preferences from eToro API to get their language setting
- Store language preference in session
- Use it to filter news to that language, or translate content
- This is a future feature — not blocking production launch

## Priority
LOW — nice to have for v2, not required for production launch.

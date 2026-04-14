## Feedback

### Performance
- Audit and optimize all API routes — add caching headers and in-memory caching for news/event data (avoid re-fetching on every request)
- Lazy-load images and add blur placeholders for event cards
- Add loading skeletons instead of spinners for the weekly view and detail pages
- Minimize client-side JavaScript — prefer server components where possible
- Ensure no layout shift (CLS) when content loads

### UI Quality
- Refine typography hierarchy — make headlines bolder, improve spacing and rhythm
- Improve event cards — add subtle hover effects, better shadows, and consistent card heights
- Make the event detail page feel more editorial — better whitespace, larger hero image, cleaner sections
- Improve the market reaction table — align numbers, add subtle row striping, use green/red for direction
- Make the Global/Local toggle more polished — should feel like a native segmented control
- Improve mobile responsiveness — cards should stack cleanly, detail page should read well on small screens
- Add smooth page transitions between weekly view and event detail
- Use a professional color palette — dark neutral background with crisp white cards, accent color for CTAs

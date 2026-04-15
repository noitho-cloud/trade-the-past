# Constraints — Trade the Past

## Design System: eToro

The app MUST follow the eToro design system exactly. Apply these tokens everywhere:

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--etoro-green` | `#0EB12E` | Primary buttons, CTAs, positive states, gains |
| `--etoro-green-hover` | `#0C9A27` | Button hover state |
| `--navy` | `#000021` | Dark backgrounds, headers |
| `--white` | `#FFFFFF` | Light backgrounds, button text on green/navy |
| `--gray-bg` | `#F5F5F5` | Page background |
| `--gray-border` | `#E5E5E5` | Borders, dividers |
| `--gray-text` | `#6B7280` | Secondary text, labels |
| `--red` | `#E31937` | Negative states, losses, bearish |
| `--text-dark` | `#1A1A1A` | Primary text |

### Typography
- Font: Load eToro Variable from CDN: `https://marketing.etorostatic.com/cache1/fonts/etoro/eToro-VF-v0.7.ttf`
- Fallback: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Page titles: 24px, weight 700
- Section headers: 18px, weight 600
- Button text: 16px, weight 600
- Body text: 14px, weight 400
- Labels/captions: 12px, weight 400

### Font-face declarations
```css
@font-face {
  font-family: "eToro";
  src: url("https://marketing.etorostatic.com/cache1/fonts/etoro/eToro-VF-v0.7.ttf") format("truetype-variations");
  font-weight: 100 900;
  font-stretch: 0% 100%;
}
```

### Spacing
| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 12px |
| `--space-lg` | 16px |
| `--space-xl` | 24px |
| `--space-2xl` | 32px |

### Buttons
- Primary: green (#0EB12E) fill, white text, pill radius (48px), 56px height (large), 48px (medium)
- Hover: #0C9A27
- Disabled: opacity 0.4
- Font: 600 weight, 16px

### Cards
- White background, 16px radius, 24px padding
- Shadow: `0 0 13px rgba(0,0,0,0.08)`

### Badges
- Fully round radius
- 12px text, 600 weight
- 4px 8px padding
- Green for bullish/positive, red for bearish/negative, gray for neutral

### Market Data Colors
- Gains/Up/Bullish: `#0EB12E` (eToro green)
- Losses/Down/Bearish: `#E31937` (eToro red)
- Neutral: `#6B7280` (gray)

### Dark Mode
| Light | Dark |
|-------|------|
| `#FFFFFF` (bg) | `#000021` (bg) |
| `#F5F5F5` (page bg) | `#0A0A2E` (page bg) |
| `#1A1A1A` (text) | `#FFFFFF` (text) |
| `#6B7280` (secondary) | `#8B8BA7` (secondary) |
| `#E5E5E5` (border) | `#2A2A4E` (border) |
| Card: white + shadow | Dark navy + subtle dark shadow |
| `#0EB12E` (green) | `#0EB12E` (unchanged) |
| `#E31937` (red) | `#E31937` (unchanged) |

- Default to user's system preference (`prefers-color-scheme`)
- Persist choice in localStorage
- Toggle in the header — sun/moon icon, clean and minimal

### Responsive — Mobile & Desktop (MANDATORY — test at every breakpoint)
- Mobile-first design, scales up to desktop
- Breakpoints: 320px, 375px, 768px, 1024px, 1280px — NO breakage at ANY width
- **Mobile (<768px):**
  - Single column layout, all cards full width
  - Affected asset cards MUST stack vertically (never side by side)
  - "Trade" and "Watchlist" buttons full width
  - Market reaction table uses horizontal scroll wrapper if needed
  - Header: logo left, dark mode toggle right, compact
  - Touch-friendly tap targets (min 44px)
  - No horizontal scroll EVER on the page body
  - Footer stacks cleanly
- **Desktop (>1024px):**
  - Max content width: 720px, centered (editorial feel)
  - Affected asset cards 2-3 per row with CSS grid
  - Generous whitespace and padding between cards
  - CTA buttons inline, not full width
  - Header expands with more spacing
- **Both:**
  - Images: max-width 100%, height auto
  - Font sizes: use clamp() for headlines and section headers
  - Scope toggle and header must not break at any width
  - overflow-x: hidden on body/html

### Header / Top Bar
- Height: 56px content area
- Background: white (light) / #000021 (dark)
- Logo "Trade the Past" left-aligned, 18px weight 700
- Right side: scope toggle, dark mode toggle
- Bottom border: 1px solid #E5E5E5 (light) / #2A2A4E (dark)

### Tables (Market Reaction)
- Clean rows, no heavy borders
- Subtle row striping: alternate rows with #F9F9F9 (light) / #0D0D35 (dark)
- Header row: 12px uppercase, weight 600, #6B7280 text
- Data cells: 14px, weight 400
- Numbers right-aligned, use eToro Numbers font (font-stretch: 84%, weight 620)
- Green/red coloring on percentage values

### Scope Toggle (Global / Local)
- Use eToro's segmented control / group button style
- Pill-shaped container with #E5E5E5 background
- Active segment: white background with subtle shadow
- Inactive: transparent, #6B7280 text
- 36px height, 12px horizontal padding per segment
- Radius: fully round

### Event Type Badges
- Match eToro's badge component
- Pill-shaped, 4px 10px padding
- 11px text, weight 600, uppercase
- Color-coded by type:
  - Interest rates: #0EB12E background at 10% opacity, #0EB12E text
  - Earnings: #F59E0B background at 10% opacity, #B45309 text
  - Regulation: #3B82F6 background at 10% opacity, #1D4ED8 text
  - Layoffs: #E31937 background at 10% opacity, #E31937 text
  - Geopolitical: #8B5CF6 background at 10% opacity, #6D28D9 text
  - Commodities: #6B7280 background at 10% opacity, #374151 text

### Transitions & Interactions
- All hover/focus transitions: 150ms ease
- Buttons: subtle scale(0.98) on press
- Cards: slight translateY(-2px) + shadow increase on hover
- Page transitions: fade-in 200ms

### General Rules
- Use eToro green (#0EB12E) for ALL primary CTAs — not black
- The "Trade" button must be green pill-shaped, matching eToro's Buy button style
- The "Watchlist" button should be secondary (white/outlined, #E5E5E5 border)
- Page background: #F5F5F5 (light) / #0A0A2E (dark)
- No emojis anywhere in the UI
- All interactive elements must have visible focus states (green outline)
- Use CSS custom properties for all tokens — no hardcoded hex values in components
- The overall feel should match eToro's product: clean, professional, confident

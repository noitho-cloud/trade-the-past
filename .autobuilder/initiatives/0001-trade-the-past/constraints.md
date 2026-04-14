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

### General Rules
- Use eToro green (#0EB12E) for ALL primary CTAs — not black
- The "Trade" button must be green pill-shaped, matching eToro's Buy button style
- The "Watchlist" button should be secondary (white/outlined)
- Page background: #F5F5F5
- No emojis anywhere in the UI

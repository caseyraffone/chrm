# App Store screenshots

Generated programmatically — do not hand-edit. To regenerate after a design change:

```bash
node scripts/generate-screenshots.js
```

The script (`scripts/generate-screenshots.js`) renders faithful HTML/CSS mockups
of 5 screens with headless Chromium (playwright-core) and captures them at the
exact App Store pixel sizes. Colors/fonts/spacing mirror `src/constants/theme.js`.

## Sizes

| Folder | Device | Resolution |
|---|---|---|
| `6.9-inch/` | iPhone 16 Pro Max | 1320×2868 |
| `6.5-inch/` | iPhone 11 Pro Max | 1242×2688 |
| `5.5-inch/` | iPhone 8 Plus | 1242×2208 |
| `ipad-13/`  | iPad Pro 13"      | 2064×2752 |

## Screens (each folder)

1. `1-welcome` — Welcome / splash
2. `2-intent` — Onboarding intent picker
3. `3-home` — Home dashboard
4. `4-practice` — Drill mid-session (recording)
5. `5-paywall` — Subscription paywall

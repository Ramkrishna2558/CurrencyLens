# 💱 CurrencyLens

**Live currency conversion on any webpage.** Detects prices automatically and shows the converted amount inline — right next to the original price.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Automatic price detection** — recognises 30+ currencies by symbol (`$`, `€`, `£`, `¥`, `₹`, …) and ISO code (`USD`, `EUR`, `GBP`, …)
- **Inline conversion** — converted prices appear right next to the original, no popups or overlays
- **Live ECB rates** — exchange rates from the European Central Bank via [frankfurter.app](https://frankfurter.app) (free, no API key)
- **Smart number parsing** — handles US (`1,234.56`), European (`1.234,56`), and plain formats
- **Dynamic content** — MutationObserver detects prices loaded via AJAX / SPA navigation
- **Dark mode** — badges adapt to the user's colour scheme
- **Privacy-first** — zero tracking, zero analytics, all processing stays local

## Quick Start (Sideload — Free)

1. **Generate icons** — open `generate-icons.html` in a browser, download the three PNGs, and place them in `icons/`.
2. Open **Chrome → `chrome://extensions`**
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** → select the `CurrencyLens/` folder
5. Click the extension icon in the toolbar, choose your target currency, and browse any site

## Project Structure

```
CurrencyLens/
├── manifest.json        # Extension manifest (MV3)
├── currencies.js        # Shared currency data & helpers
├── background.js        # Service worker — rate fetching & caching
├── content.js           # Content script — price detection & conversion
├── content.css          # Conversion badge styles
├── popup.html/js/css    # Settings popup UI
├── icons/               # Extension icons (16/48/128 px)
├── generate-icons.html  # Dev tool to create icon PNGs
├── pack.ps1             # PowerShell packaging script
├── store/description.txt# Web Store listing copy
└── README.md
```

## How It Works

1. **Background service worker** fetches USD-based rates from `api.frankfurter.app` and caches them in `chrome.storage.local` (1-hour TTL).
2. **Content script** walks the DOM using `TreeWalker`, applies a multi-pattern regex to find prices, and injects a styled `<span>` badge with the conversion.
3. A `MutationObserver` (debounced at 300 ms) re-scans any newly added DOM nodes so SPAs and infinite-scroll pages work seamlessly.
4. **Popup** lets the user toggle the extension on/off, pick a target currency, and manually refresh rates.

## Publishing to Chrome Web Store

### Prerequisites

- A [Google Developer account](https://chrome.google.com/webstore/devconsole) — one-time $5 registration fee
- Icon PNGs in `icons/` (use `generate-icons.html`)
- At least one 1280×800 screenshot of the extension in action

### Steps

1. **Package** the extension:
   ```powershell
   .\pack.ps1
   ```
   This creates `CurrencyLens.zip`.

2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

3. Click **New Item** → upload `CurrencyLens.zip`.

4. Fill in:
   - **Description** — use `store/description.txt`
   - **Category** — Productivity
   - **Language** — English
   - **Screenshots** — at least one 1280×800 PNG
   - **Icon** — 128×128 PNG (from `icons/icon128.png`)

5. Submit for review. Initial review typically takes 1–3 business days.

### Publishing to Edge Add-ons (Also Free)

The same ZIP works for [Microsoft Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview). The process is nearly identical — upload the ZIP, fill in metadata, and submit.

## Configuration

All settings are stored in `chrome.storage.local`:

| Key | Default | Description |
|-----|---------|-------------|
| `cl_settings.enabled` | `true` | Master on/off toggle |
| `cl_settings.targetCurrency` | `"EUR"` | ISO 4217 code for the conversion target |
| `cl_rates` | — | Cached rate data with `fetchedAt` timestamp |

## Supported Currencies

AUD, BGN, BRL, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HKD, HUF, IDR, ILS, INR, ISK, JPY, KRW, MXN, MYR, NOK, NZD, PHP, PLN, RON, SEK, SGD, THB, TRY, USD, ZAR

## API

Rates come from [frankfurter.app](https://frankfurter.app), which sources data from the **European Central Bank**. Rates are updated once per business day (around 16:00 CET). The extension caches locally and refreshes every hour.

**No API key required.** No rate limits for reasonable usage.

## Privacy

- The extension connects **only** to `api.frankfurter.app` to fetch rates.
- **No browsing data** is collected, stored, or transmitted.
- All price detection and conversion happens **locally** in the browser.

## License

MIT — see [LICENSE](LICENSE).

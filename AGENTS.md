# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MudraLens is a Chrome Manifest V3 extension that automatically detects prices on webpages and displays inline currency conversions.

**Core architecture:**
- **Background service worker** (`background.js`) â€” fetches exchange rates from open.er-api.com API (ExchangeRate-API supporting 160+ currencies including Middle Eastern) and caches them in `chrome.storage.local` with 1-hour TTL
- **Content script** (`content.js`) â€” injected into all pages; uses TreeWalker + regex to detect prices in text nodes, computes conversions, and injects styled `<span>` badges
- **Popup UI** (`popup.html/js/css`) â€” extension settings interface for toggling on/off, selecting target currency, and manually refreshing rates
- **Shared currency data** (`currencies.js`) â€” loaded by both content script (via manifest) and background worker (via `importScripts`)

## Key Development Commands

### Package extension for Chrome Web Store / Edge Add-ons
```pwsh
.\pack.ps1
```
Creates `MudraLens.zip` containing only the files needed for distribution. Verifies all required files exist before packaging.

### Local testing (sideload)
1. Open Chrome â†’ `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** â†’ select `C:\PersonaProjects\MudraLens`
4. Browse any webpage with prices to test

### Generate icons (required before packaging)
Open `generate-icons.html` in a browser, download the three PNG files, and place them in `icons/` folder.

## Architecture Notes

### Price Detection Flow
1. Content script builds a multi-pattern regex at runtime from `CL_CURRENCIES` data
2. Regex matches four price formats: `$100`, `100â‚¬`, `USD 100`, `100 USD`
3. Number parser handles three locales: US (`1,234.56`), EU (`1.234,56`), plain (`1234`)
4. TreeWalker traverses text nodes only, skipping `<script>`, `<style>`, `<code>`, `<input>`, etc.
5. Detected prices are wrapped in `<span data-cl-processed="1">`, conversion badge appended as `<span class="cl-converted">`
6. MutationObserver (300ms debounced) re-scans new DOM nodes for SPA/AJAX support

### Rate Management
- Base currency is always USD (API constraint)
- Rates cached with `{ rates: {USD: 1, EUR: 0.92, â€¦}, date: "2024-01-15", fetchedAt: 1234567890 }`
- Cross-rate conversion: `(amount / rates[fromCode]) * rates[toCode]`
- Popup can force-refresh rates; background worker auto-fetches on extension install

### Settings Storage
All settings stored in `chrome.storage.local`:
- `cl_settings.enabled` (boolean) â€” master on/off toggle
- `cl_settings.targetCurrency` (string) â€” ISO 4217 code (default: "EUR")
- `cl_rates` (object) â€” cached rate data with `fetchedAt` timestamp

When settings change in popup, background worker broadcasts `SETTINGS_CHANGED` message to all tabs so content scripts react immediately (remove/re-add badges).

## Code Patterns & Constraints

### No build tooling
- Plain ES5/ES6 JavaScript, no transpilation
- No npm/package.json, no node_modules
- No bundler (webpack/rollup/vite)
- All files loaded directly via manifest or `importScripts`

### Chrome Extension API usage
- **Background worker:** Manifest V3 service worker context (no DOM, no localStorage)
- **Content script:** Runs in page context with DOM access but isolated from page JS
- **Message passing:** All communication between background â†” content â†” popup uses `chrome.runtime.sendMessage` / `onMessage`
- **Permissions:** `storage`, `activeTab`, `host_permissions` for `open.er-api.com`

### DOM manipulation safeguards
- Never process editable elements (`isContentEditable`)
- Never inject badges into existing `.cl-converted` spans or `[data-cl-processed]` elements
- TreeWalker filter rejects unsuitable nodes early to avoid unnecessary processing
- Fragment-based replacement prevents layout thrashing when injecting multiple badges per text node

## File Purposes

- **manifest.json** â€” Extension metadata, permissions, content script registration
- **background.js** â€” Rate fetching logic, settings management, message router
- **content.js** â€” DOM scanning, price detection regex, conversion math, badge injection
- **currencies.js** â€” Shared data structure for symbols (`$`, `â‚¬`), multi-char symbols (`CA$`, `R$`), ISO codes, and currency metadata (name, flag, decimals)
- **popup.html/js/css** â€” 300Ã—400px UI for settings (toggle, currency dropdown, refresh button)
- **content.css** â€” Badge styling with dark mode support via `prefers-color-scheme`
- **pack.ps1** â€” PowerShell script to create Web Store ZIP package
- **generate-icons.html** â€” Standalone HTML tool to generate 16/48/128px PNGs from canvas

## Deployment

### Publishing checklist
1. Run `.\pack.ps1` to create `MudraLens.zip`
2. Icons must exist in `icons/` (use `generate-icons.html`)
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) â€” $5 one-time fee
4. Same ZIP works for [Microsoft Edge Add-ons](https://partner.microsoft.com/dashboard/microsoftedge) â€” no fee
5. Fill metadata using `store/description.txt` for listing copy

### Version updates
1. Increment `version` in `manifest.json`
2. Re-package with `.\pack.ps1`
3. Upload new ZIP to Web Store dashboard

## Testing Guidance

### Manual testing scenarios
- **US format numbers:** `$1,234.56`
- **EU format numbers:** `â‚¬1.234,56`
- **ISO codes:** `USD 100`, `100 EUR`
- **Multi-char symbols:** `CA$50`, `R$200`
- **Dynamic content:** Test on SPA sites (e.g., Twitter/X, GitHub) to verify MutationObserver
- **Dark mode:** Toggle OS/browser dark mode to verify badge color adaptation
- **Edge cases:** Very large numbers (>1e12), zero/negative amounts (should not convert), non-price numbers (should not match)

### Common issues
- **Icons missing:** Run `generate-icons.html` and place PNGs in `icons/`
- **Rates not loading:** Check network tab for `open.er-api.com` requests, verify `host_permissions` in manifest
- **Badges not appearing:** Check console for errors, verify extension is enabled in popup, check if rates are cached in `chrome.storage.local`
- **Double conversion:** Check if site already has price conversion plugin (conflict)
- **Noon console noise:** `ERR_BLOCKED_BY_CLIENT` and `Permissions-Policy` warnings are usually site/adblock related and not extension conversion failures

## API Details

**Endpoint:** `https://open.er-api.com/v6/latest/USD`

**Response format:**
```json
{
  "result": "success",
  "base_code": "USD",
  "time_last_update_unix": 1770422552,
  "time_last_update_utc": "Sat, 07 Feb 2026 00:02:32 +0000",
  "rates": {
    "USD": 1,
    "EUR": 0.846761,
    "AED": 3.6725,
    "SAR": 3.75,
    ...
  }
}
```

- Free, no API key required
- Rates updated multiple times per day
- No rate limits for reasonable usage
- Supports 160+ currencies including Middle Eastern (AED, SAR, QAR, KWD, BHD, OMR, JOD, EGP, IQD, LBP)
- Arabic currency symbols supported: Ø¯.Ø¥, Ø±.Ø³, Ø±.Ù‚, Ø¯.Ùƒ, Ø¯.Ø¨, Ø±.Ø¹, Ø¯.Ø¹


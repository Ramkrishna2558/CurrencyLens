# âš¡ MudraLens

**Live currency conversion on any webpage.** Detects prices automatically and shows the converted amount inline â€” right next to the original price.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)
[![GitHub](https://img.shields.io/badge/GitHub-Ramkrishna2558%2FMudraLens-181717?logo=github)](https://github.com/Ramkrishna2558/MudraLens)

## ðŸ“– Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Supported Currencies](#supported-currencies)
- [Development](#development)
- [Publishing](#publishing-to-chrome-web-store)
- [Contributing](#contributing)
- [Privacy](#privacy)
- [License](#license)

## âœ¨ Features

- **ðŸŽ¯ Automatic price detection** â€” recognises 40+ currencies including Middle Eastern currencies by symbol (`$`, `â‚¬`, `Â£`, `Ø¯.Ø¥`, `Ø±.Ø³`, â€¦) and ISO code (`USD`, `EUR`, `AED`, `SAR`, â€¦)
- **ðŸ’¸ Inline conversion** â€” converted prices appear right next to the original, no popups or overlays
- **ðŸ“Š Live exchange rates** â€” real-time rates from [ExchangeRate-API](https://www.exchangerate-api.com) supporting 160+ currencies (free, no API key)
- **ðŸ§  Smart number parsing** â€” handles US (`1,234.56`), European (`1.234,56`), and plain formats
- **âš¡ Dynamic content** â€” MutationObserver detects prices loaded via AJAX / SPA navigation
- **ðŸŒ™ Dark mode** â€” badges adapt to the user's colour scheme
- **ðŸ”’ Privacy-first** â€” zero tracking, zero analytics, all processing stays local

## ðŸ“¥ Installation

### Option 1: Chrome Web Store (Recommended)

*Coming soon â€” extension will be available on the Chrome Web Store*

### Option 2: Sideload (Free, No Account Required)

Perfect for developers or anyone who wants to try the extension before it's published:

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/Ramkrishna2558/MudraLens.git
   cd MudraLens
   ```

2. **Generate icons** â€” open `generate-icons.html` in a browser, download the three PNGs (16px, 48px, 128px), and place them in the `icons/` folder.

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `MudraLens/` folder

4. **Start using** â€” click the extension icon in the toolbar, choose your target currency, and browse any website with prices!

### Edge/Opera Installation

The same steps work for Microsoft Edge (`edge://extensions`) and Opera (`opera://extensions`).

## ðŸš€ Usage

1. **Click the extension icon** in your browser toolbar to open the settings popup.

2. **Select your target currency** from the dropdown (e.g., EUR, GBP, INR).

3. **Browse any website** with prices â€” MudraLens will automatically detect and convert them inline.

4. **Toggle on/off** anytime using the switch in the popup.

5. **Refresh rates manually** by clicking the refresh button (â†») in the popup.

### Example

When you visit a website showing `$299.99`, you'll see:
```
$299.99 (â‰ˆ â‚¬276.45)
```

The converted amount appears right next to the original price, styled with a subtle badge that adapts to light/dark mode.

## ðŸ“ Project Structure

```
MudraLens/
â”œâ”€â”€ manifest.json        # Extension manifest (MV3)
â”œâ”€â”€ currencies.js        # Shared currency data & helpers
â”œâ”€â”€ background.js        # Service worker â€” rate fetching & caching
â”œâ”€â”€ content.js           # Content script â€” price detection & conversion
â”œâ”€â”€ content.css          # Conversion badge styles
â”œâ”€â”€ popup.html/js/css    # Settings popup UI
â”œâ”€â”€ icons/               # Extension icons (16/48/128 px)
â”œâ”€â”€ generate-icons.html  # Dev tool to create icon PNGs
â”œâ”€â”€ pack.ps1             # PowerShell packaging script
â”œâ”€â”€ store/description.txt# Web Store listing copy
â””â”€â”€ README.md
```

## âš™ï¸ How It Works

1. **Background service worker** fetches USD-based rates from `open.er-api.com` supporting 160+ currencies and caches them in `chrome.storage.local` (1-hour TTL).
2. **Content script** walks the DOM using `TreeWalker`, applies a multi-pattern regex to find prices, and injects a styled `<span>` badge with the conversion.
3. A `MutationObserver` (debounced at 300 ms) re-scans any newly added DOM nodes so SPAs and infinite-scroll pages work seamlessly.
4. **Popup** lets the user toggle the extension on/off, pick a target currency, and manually refresh rates.

## ðŸ“¦ Development

### Prerequisites

- Chrome, Edge, or Opera browser
- Basic knowledge of JavaScript and Chrome Extension APIs
- Git (for version control)

### Local Development

1. Make your changes to the source files
2. If you modified the extension, click the refresh icon on `chrome://extensions` to reload it
3. Test on various websites to ensure price detection works correctly

### Building for Distribution

To package the extension for Chrome Web Store or Edge Add-ons:

```powershell
.\pack.ps1
```

This PowerShell script creates `MudraLens.zip` containing only the necessary files.
- Verify all required files exist
- Create a clean ZIP package
- Report the final package size

### Testing Checklist

Before publishing, test these scenarios:

- [ ] **US format numbers:** `$1,234.56`
- [ ] **EU format numbers:** `â‚¬1.234,56`
- [ ] **ISO codes:** `USD 100`, `100 EUR`
- [ ] **Multi-char symbols:** `CA$50`, `R$200`, `HK$100`
- [ ] **Dynamic content:** Test on SPA sites (Twitter/X, GitHub) to verify MutationObserver
- [ ] **Dark mode:** Toggle OS/browser dark mode to verify badge styling
- [ ] **Edge cases:** Very large numbers (>1e12), zero/negative amounts, non-price numbers
- [ ] **Settings persistence:** Change currency, refresh page, verify setting persists
- [ ] **Toggle functionality:** Disable extension, verify badges disappear

### Noon / RTL Notes

- If a site renders the currency symbol and number in separate sibling nodes, MudraLens now detects that pattern.
- On Noon, console lines such as `net::ERR_BLOCKED_BY_CLIENT` for Sentry/eTracker/boomerang are usually from ad blockers or browser tracking protection, not from MudraLens.
- `Permissions-Policy header: Unrecognized feature: 'browsing-topics'` is site/browser policy noise and does not break conversion.

## ðŸ“¤ Publishing to Chrome Web Store

### Prerequisites

- A [Google Developer account](https://chrome.google.com/webstore/devconsole) â€” one-time $5 registration fee
- Icon PNGs in `icons/` (use `generate-icons.html`)
- At least one 1280Ã—800 screenshot of the extension in action

### Steps

1. **Package** the extension:
   ```powershell
   .\pack.ps1
   ```
   This creates `MudraLens.zip`.

2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

3. Click **New Item** â†’ upload `MudraLens.zip`.

4. Fill in:
   - **Description** â€” use `store/description.txt`
   - **Category** â€” Productivity
   - **Language** â€” English
   - **Screenshots** â€” at least one 1280Ã—800 PNG
   - **Icon** â€” 128Ã—128 PNG (from `icons/icon128.png`)

5. Submit for review. Initial review typically takes 1â€“3 business days.

### Publishing to Edge Add-ons (Also Free)

The same ZIP works for [Microsoft Edge Add-ons](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview). The process is nearly identical â€” upload the ZIP, fill in metadata, and submit.

## ðŸ”§ Configuration

All settings are stored in `chrome.storage.local`:

| Key | Default | Description |
|-----|---------|-------------|
| `cl_settings.enabled` | `true` | Master on/off toggle |
| `cl_settings.targetCurrency` | `"EUR"` | ISO 4217 code for the conversion target |
| `cl_rates` | â€” | Cached rate data with `fetchedAt` timestamp |

## ðŸŒ Supported Currencies

### Major Currencies
USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD

### Middle Eastern & Gulf Currencies ðŸœï¸
**AED** (UAE Dirham), **SAR** (Saudi Riyal), **QAR** (Qatari Riyal), **KWD** (Kuwaiti Dinar), **BHD** (Bahraini Dinar), **OMR** (Omani Rial), **JOD** (Jordanian Dinar), **EGP** (Egyptian Pound), **IQD** (Iraqi Dinar), **LBP** (Lebanese Pound)

### Asian Currencies
CNY, INR, HKD, SGD, KRW, THB, MYR, IDR, PHP

### European Currencies
SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, ISK, TRY

### Americas & Others
BRL, MXN, ZAR, ILS

**Total: 40+ currencies supported** with Arabic script support for Gulf currencies (Ø¯.Ø¥, Ø±.Ø³, Ø±.Ù‚, etc.)

## ðŸ”Œ API

Rates come from [ExchangeRate-API](https://www.exchangerate-api.com), a free currency conversion API that supports **160+ currencies** including all major, regional, and Middle Eastern currencies. The extension caches rates locally and refreshes every hour.

**Endpoint:** `https://open.er-api.com/v6/latest/USD`

**Features:**
- âœ… No API key required
- âœ… No rate limits for reasonable usage
- âœ… Free and open-source API
- âœ… 160+ currencies including Middle Eastern (AED, SAR, QAR, etc.)
- âœ… Updated multiple times per day
- âœ… Reliable uptime and fast response

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
    "GBP": 0.735517,
    "AED": 3.6725,
    "SAR": 3.75,
    "QAR": 3.64,
    ...
  }
}
```

## ðŸ¤ Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/Ramkrishna2558/MudraLens/issues) with:
- A clear description of the problem or feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Browser version and OS
- Screenshots if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly using the testing checklist above
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style (ES5/ES6 vanilla JavaScript)
- No external dependencies or build tools (keep it simple!)
- Test on multiple websites before submitting
- Update documentation if you change functionality
- Add comments for complex logic

### Areas for Contribution

- ðŸ› **Bug fixes** â€” especially edge cases in price detection
- ðŸŒ **Currency support** â€” add more currencies or improve symbol detection
- ðŸŽ¨ **UI improvements** â€” better badge styling or popup design
- ðŸ“ **Documentation** â€” improve README, add tutorials, create wiki pages
- ðŸ§ª **Testing** â€” report bugs, test on different websites
- ðŸŒ **Internationalization** â€” translate the extension to other languages

## ðŸ”’ Privacy

MudraLens is built with privacy as a core principle:

- âœ… **No tracking** â€” zero analytics, zero telemetry
- âœ… **No ads** â€” completely ad-free
- âœ… **No data collection** â€” no browsing data is collected, stored, or transmitted
- âœ… **Local processing** â€” all price detection and conversion happens in your browser
- âœ… **Minimal permissions** â€” only requests `storage` and `activeTab` permissions
- âœ… **Single external connection** â€” only connects to `open.er-api.com` to fetch exchange rates
- âœ… **Open source** â€” all code is public and auditable

## ðŸ“œ License

This project is licensed under the **MIT License** â€” see the [LICENSE](LICENSE) file for details.

You are free to:
- âœ… Use the extension commercially or personally
- âœ… Modify and distribute the code
- âœ… Use it in private projects

## â­ Support

If you find MudraLens useful, please consider:

- â­ **Starring the repository** on GitHub
- ðŸ› **Reporting bugs** or suggesting features
- ðŸ’¬ **Sharing** with friends and colleagues
- ðŸ“ **Contributing** to the code or documentation

## ðŸ“§ Contact

- **GitHub:** [@Ramkrishna2558](https://github.com/Ramkrishna2558)
- **Repository:** [MudraLens](https://github.com/Ramkrishna2558/MudraLens)
- **Issues:** [Report a bug](https://github.com/Ramkrishna2558/MudraLens/issues)

---

<p align="center">Made with â¤ï¸ by <a href="https://github.com/Ramkrishna2558">Ramkrishna2558</a></p>
<p align="center">
  <sub>If this project helped you, please consider giving it a â­ on GitHub!</sub>
</p>


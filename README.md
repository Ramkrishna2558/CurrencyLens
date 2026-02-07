# ⚡ XRate

**Live currency conversion on any webpage.** Detects prices automatically and shows the converted amount inline — right next to the original price.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)
[![GitHub](https://img.shields.io/badge/GitHub-Ramkrishna2558%2FXRate-181717?logo=github)](https://github.com/Ramkrishna2558/XRate)

## 📖 Table of Contents

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

## ✨ Features

- **🎯 Automatic price detection** — recognises 40+ currencies including Middle Eastern currencies by symbol (`$`, `€`, `£`, `د.إ`, `ر.س`, …) and ISO code (`USD`, `EUR`, `AED`, `SAR`, …)
- **💸 Inline conversion** — converted prices appear right next to the original, no popups or overlays
- **📊 Live exchange rates** — real-time rates from [ExchangeRate-API](https://www.exchangerate-api.com) supporting 160+ currencies (free, no API key)
- **🧠 Smart number parsing** — handles US (`1,234.56`), European (`1.234,56`), and plain formats
- **⚡ Dynamic content** — MutationObserver detects prices loaded via AJAX / SPA navigation
- **🌙 Dark mode** — badges adapt to the user's colour scheme
- **🔒 Privacy-first** — zero tracking, zero analytics, all processing stays local

## 📥 Installation

### Option 1: Chrome Web Store (Recommended)

*Coming soon — extension will be available on the Chrome Web Store*

### Option 2: Sideload (Free, No Account Required)

Perfect for developers or anyone who wants to try the extension before it's published:

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/Ramkrishna2558/XRate.git
   cd XRate
   ```

2. **Generate icons** — open `generate-icons.html` in a browser, download the three PNGs (16px, 48px, 128px), and place them in the `icons/` folder.

3. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `XRate/` folder

4. **Start using** — click the extension icon in the toolbar, choose your target currency, and browse any website with prices!

### Edge/Opera Installation

The same steps work for Microsoft Edge (`edge://extensions`) and Opera (`opera://extensions`).

## 🚀 Usage

1. **Click the extension icon** in your browser toolbar to open the settings popup.

2. **Select your target currency** from the dropdown (e.g., EUR, GBP, INR).

3. **Browse any website** with prices — CurrencyLens will automatically detect and convert them inline.

4. **Toggle on/off** anytime using the switch in the popup.

5. **Refresh rates manually** by clicking the refresh button (↻) in the popup.

### Example

When you visit a website showing `$299.99`, you'll see:
```
$299.99 (≈ €276.45)
```

The converted amount appears right next to the original price, styled with a subtle badge that adapts to light/dark mode.

## 📁 Project Structure

```
XRate/
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

## ⚙️ How It Works

1. **Background service worker** fetches USD-based rates from `open.er-api.com` supporting 160+ currencies and caches them in `chrome.storage.local` (1-hour TTL).
2. **Content script** walks the DOM using `TreeWalker`, applies a multi-pattern regex to find prices, and injects a styled `<span>` badge with the conversion.
3. A `MutationObserver` (debounced at 300 ms) re-scans any newly added DOM nodes so SPAs and infinite-scroll pages work seamlessly.
4. **Popup** lets the user toggle the extension on/off, pick a target currency, and manually refresh rates.

## 📦 Development

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

This PowerShell script creates `XRate.zip` containing only the necessary files.
- Verify all required files exist
- Create a clean ZIP package
- Report the final package size

### Testing Checklist

Before publishing, test these scenarios:

- [ ] **US format numbers:** `$1,234.56`
- [ ] **EU format numbers:** `€1.234,56`
- [ ] **ISO codes:** `USD 100`, `100 EUR`
- [ ] **Multi-char symbols:** `CA$50`, `R$200`, `HK$100`
- [ ] **Dynamic content:** Test on SPA sites (Twitter/X, GitHub) to verify MutationObserver
- [ ] **Dark mode:** Toggle OS/browser dark mode to verify badge styling
- [ ] **Edge cases:** Very large numbers (>1e12), zero/negative amounts, non-price numbers
- [ ] **Settings persistence:** Change currency, refresh page, verify setting persists
- [ ] **Toggle functionality:** Disable extension, verify badges disappear

## 📤 Publishing to Chrome Web Store

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

## 🔧 Configuration

All settings are stored in `chrome.storage.local`:

| Key | Default | Description |
|-----|---------|-------------|
| `cl_settings.enabled` | `true` | Master on/off toggle |
| `cl_settings.targetCurrency` | `"EUR"` | ISO 4217 code for the conversion target |
| `cl_rates` | — | Cached rate data with `fetchedAt` timestamp |

## 🌍 Supported Currencies

### Major Currencies
USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD

### Middle Eastern & Gulf Currencies 🏜️
**AED** (UAE Dirham), **SAR** (Saudi Riyal), **QAR** (Qatari Riyal), **KWD** (Kuwaiti Dinar), **BHD** (Bahraini Dinar), **OMR** (Omani Rial), **JOD** (Jordanian Dinar), **EGP** (Egyptian Pound), **IQD** (Iraqi Dinar), **LBP** (Lebanese Pound)

### Asian Currencies
CNY, INR, HKD, SGD, KRW, THB, MYR, IDR, PHP

### European Currencies
SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, ISK, TRY

### Americas & Others
BRL, MXN, ZAR, ILS

**Total: 40+ currencies supported** with Arabic script support for Gulf currencies (د.إ, ر.س, ر.ق, etc.)

## 🔌 API

Rates come from [ExchangeRate-API](https://www.exchangerate-api.com), a free currency conversion API that supports **160+ currencies** including all major, regional, and Middle Eastern currencies. The extension caches rates locally and refreshes every hour.

**Endpoint:** `https://open.er-api.com/v6/latest/USD`

**Features:**
- ✅ No API key required
- ✅ No rate limits for reasonable usage
- ✅ Free and open-source API
- ✅ 160+ currencies including Middle Eastern (AED, SAR, QAR, etc.)
- ✅ Updated multiple times per day
- ✅ Reliable uptime and fast response

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

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/Ramkrishna2558/CurrencyLens/issues) with:
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

- 🐛 **Bug fixes** — especially edge cases in price detection
- 🌍 **Currency support** — add more currencies or improve symbol detection
- 🎨 **UI improvements** — better badge styling or popup design
- 📝 **Documentation** — improve README, add tutorials, create wiki pages
- 🧪 **Testing** — report bugs, test on different websites
- 🌏 **Internationalization** — translate the extension to other languages

## 🔒 Privacy

CurrencyLens is built with privacy as a core principle:

- ✅ **No tracking** — zero analytics, zero telemetry
- ✅ **No ads** — completely ad-free
- ✅ **No data collection** — no browsing data is collected, stored, or transmitted
- ✅ **Local processing** — all price detection and conversion happens in your browser
- ✅ **Minimal permissions** — only requests `storage` and `activeTab` permissions
- ✅ **Single external connection** — only connects to `open.er-api.com` to fetch exchange rates
- ✅ **Open source** — all code is public and auditable

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use the extension commercially or personally
- ✅ Modify and distribute the code
- ✅ Use it in private projects

## ⭐ Support

If you find XRate useful, please consider:

- ⭐ **Starring the repository** on GitHub
- 🐛 **Reporting bugs** or suggesting features
- 💬 **Sharing** with friends and colleagues
- 📝 **Contributing** to the code or documentation

## 📧 Contact

- **GitHub:** [@Ramkrishna2558](https://github.com/Ramkrishna2558)
- **Repository:** [XRate](https://github.com/Ramkrishna2558/XRate)
- **Issues:** [Report a bug](https://github.com/Ramkrishna2558/XRate/issues)

---

<p align="center">Made with ❤️ by <a href="https://github.com/Ramkrishna2558">Ramkrishna2558</a></p>
<p align="center">
  <sub>If this project helped you, please consider giving it a ⭐ on GitHub!</sub>
</p>

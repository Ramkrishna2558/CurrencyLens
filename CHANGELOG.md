# Changelog

All notable changes to XRate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-02-07

### Fixed
- **Critical: First load issue** - Extension now works correctly on first page load
  - Fixed race condition where content script initializes before rates are fetched
  - Added retry logic (3 attempts with 1-second delay) for rate fetching
  - Added storage change listener to react when rates become available
  - Background worker now proactively fetches rates on startup
- Extension now works consistently across all websites (BestBuy, Amazon, etc.)
- Graceful handling of network delays and API issues
- Automatic retry mechanism for failed rate fetches

### Technical Details
- Added `chrome.storage.onChanged` listener in content script
- Added `chrome.runtime.onStartup` listener in background worker
- Implemented exponential backoff retry logic for rate fetching
- Observer now sets up even when rates aren't initially available

## [1.1.0] - 2026-02-07

### Added
- **Middle Eastern & Gulf Currency Support** 🏜️
  - AED (UAE Dirham) - د.إ
  - SAR (Saudi Riyal) - ر.س
  - QAR (Qatari Riyal) - ر.ق
  - KWD (Kuwaiti Dinar) - د.ك
  - BHD (Bahraini Dinar) - د.ب
  - OMR (Omani Rial) - ر.ع
  - JOD (Jordanian Dinar) - د.ع
  - EGP (Egyptian Pound) - E£
  - IQD (Iraqi Dinar)
  - LBP (Lebanese Pound) - L£
- Arabic script support for currency symbols
- Support for 160+ currencies (up from 30+)

### Changed
- **Switched API provider** from frankfurter.app to ExchangeRate-API (open.er-api.com)
  - More frequent rate updates (multiple times per day vs. once daily)
  - Much broader currency coverage (160+ currencies)
  - Better regional support including complete Middle Eastern coverage
- Updated manifest host permissions from `api.frankfurter.app` to `open.er-api.com`
- Enhanced currency metadata with proper decimal places for Gulf currencies (3 decimals for KWD, BHD, OMR, JOD)
- Updated popup UI footer to reference ExchangeRate-API
- Updated all documentation (README.md, AGENTS.md, store description) to reflect new currencies and API

### Technical Details
- Background worker now handles ExchangeRate-API's response format
- Added 10 new currency codes to `currencies.js`
- Added 7 Arabic currency symbols to multi-symbol map
- Updated rate date parsing to handle Unix timestamps
- Maintained backward compatibility with existing cached rates

## [1.0.0] - Initial Release

### Added
- Automatic price detection for 30+ currencies
- Inline conversion badges next to original prices
- Support for multiple number formats (US, European, plain)
- Dynamic content detection via MutationObserver
- Dark mode support
- Privacy-first design (no tracking, no ads)
- Chrome Manifest V3 compliance
- Popup UI for settings and currency selection
- 1-hour rate caching
- Support for currency symbols ($, €, £, ¥, ₹, etc.) and ISO codes
- Smart number parsing for localized formats
- TreeWalker-based DOM scanning
- Fragment-based badge injection

### Supported Currencies (v1.0.0)
USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD, CNY, INR, HKD, SGD, KRW, THB, MYR, IDR, PHP, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, ISK, TRY, BRL, MXN, ZAR, ILS

[1.1.1]: https://github.com/Ramkrishna2558/XRate/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Ramkrishna2558/XRate/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Ramkrishna2558/XRate/releases/tag/v1.0.0

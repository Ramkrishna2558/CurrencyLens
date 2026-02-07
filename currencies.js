/**
 * XRate — Shared currency configuration.
 * Loaded by content scripts (via manifest) and background (via importScripts).
 * Supports 160+ currencies via ExchangeRate-API including Middle Eastern currencies.
 */

/* eslint-disable no-unused-vars */
const CL_CURRENCIES = {
  // Maps single-character symbols → default currency code
  symbols: {
    '$':  'USD',
    '€':  'EUR',
    '£':  'GBP',
    '¥':  'JPY',
    '₹':  'INR',
    '₩':  'KRW',
    '₽':  'RUB',
    '₪':  'ILS',
    '₱':  'PHP',
    '₺':  'TRY',
    '฿':  'THB',
  },

  // Multi-char symbols — matched BEFORE single-char to avoid partial matches
  multiSymbols: {
    'R$':  'BRL',
    'CA$': 'CAD',
    'A$':  'AUD',
    'NZ$': 'NZD',
    'HK$': 'HKD',
    'S$':  'SGD',
    'MX$': 'MXN',
    'RM':  'MYR',
    'Rp':  'IDR',
    'Ft':  'HUF',
    'zł':  'PLN',
    'Kč':  'CZK',
    'kr':  'SEK',   // Also NOK/DKK — defaults to SEK
    'lei': 'RON',
    'лв':  'BGN',
    'CHF': 'CHF',
    'AED': 'AED',   // UAE Dirham (also written as code)
    'SAR': 'SAR',   // Saudi Riyal
    'QAR': 'QAR',   // Qatari Riyal
    'KWD': 'KWD',   // Kuwaiti Dinar
    'BHD': 'BHD',   // Bahraini Dinar
    'OMR': 'OMR',   // Omani Rial
    'JOD': 'JOD',   // Jordanian Dinar
    'د.إ': 'AED',   // Arabic Dirham symbol
    'د.ب': 'BHD',   // Arabic Dinar symbol (Bahrain)
    'د.ك': 'KWD',   // Arabic Dinar symbol (Kuwait)
    'د.ع': 'JOD',   // Arabic Dinar symbol (Jordan)
    'ر.س': 'SAR',   // Arabic Riyal symbol (Saudi)
    'ر.ق': 'QAR',   // Arabic Riyal symbol (Qatar)
    'ر.ع': 'OMR',   // Arabic Rial symbol (Oman)
  },

  // Metadata for all supported currencies (frankfurter.app / ECB set)
  codes: {
    USD: { name: 'US Dollar',           symbol: '$',   flag: '🇺🇸', decimals: 2 },
    EUR: { name: 'Euro',                symbol: '€',   flag: '🇪🇺', decimals: 2 },
    GBP: { name: 'British Pound',       symbol: '£',   flag: '🇬🇧', decimals: 2 },
    JPY: { name: 'Japanese Yen',        symbol: '¥',   flag: '🇯🇵', decimals: 0 },
    INR: { name: 'Indian Rupee',        symbol: '₹',   flag: '🇮🇳', decimals: 2 },
    CAD: { name: 'Canadian Dollar',     symbol: 'CA$', flag: '🇨🇦', decimals: 2 },
    AUD: { name: 'Australian Dollar',   symbol: 'A$',  flag: '🇦🇺', decimals: 2 },
    CHF: { name: 'Swiss Franc',         symbol: 'CHF', flag: '🇨🇭', decimals: 2 },
    CNY: { name: 'Chinese Yuan',        symbol: '¥',   flag: '🇨🇳', decimals: 2 },
    SEK: { name: 'Swedish Krona',       symbol: 'kr',  flag: '🇸🇪', decimals: 2 },
    NZD: { name: 'New Zealand Dollar',  symbol: 'NZ$', flag: '🇳🇿', decimals: 2 },
    KRW: { name: 'South Korean Won',    symbol: '₩',   flag: '🇰🇷', decimals: 0 },
    SGD: { name: 'Singapore Dollar',    symbol: 'S$',  flag: '🇸🇬', decimals: 2 },
    HKD: { name: 'Hong Kong Dollar',    symbol: 'HK$', flag: '🇭🇰', decimals: 2 },
    NOK: { name: 'Norwegian Krone',     symbol: 'kr',  flag: '🇳🇴', decimals: 2 },
    MXN: { name: 'Mexican Peso',        symbol: 'MX$', flag: '🇲🇽', decimals: 2 },
    BRL: { name: 'Brazilian Real',      symbol: 'R$',  flag: '🇧🇷', decimals: 2 },
    DKK: { name: 'Danish Krone',        symbol: 'kr',  flag: '🇩🇰', decimals: 2 },
    PLN: { name: 'Polish Złoty',        symbol: 'zł',  flag: '🇵🇱', decimals: 2 },
    THB: { name: 'Thai Baht',           symbol: '฿',   flag: '🇹🇭', decimals: 2 },
    IDR: { name: 'Indonesian Rupiah',   symbol: 'Rp',  flag: '🇮🇩', decimals: 0 },
    HUF: { name: 'Hungarian Forint',    symbol: 'Ft',  flag: '🇭🇺', decimals: 0 },
    CZK: { name: 'Czech Koruna',        symbol: 'Kč',  flag: '🇨🇿', decimals: 2 },
    ILS: { name: 'Israeli Shekel',      symbol: '₪',   flag: '🇮🇱', decimals: 2 },
    PHP: { name: 'Philippine Peso',     symbol: '₱',   flag: '🇵🇭', decimals: 2 },
    TRY: { name: 'Turkish Lira',        symbol: '₺',   flag: '🇹🇷', decimals: 2 },
    ZAR: { name: 'South African Rand',  symbol: 'R',   flag: '🇿🇦', decimals: 2 },
    MYR: { name: 'Malaysian Ringgit',   symbol: 'RM',  flag: '🇲🇾', decimals: 2 },
    RON: { name: 'Romanian Leu',        symbol: 'lei', flag: '🇷🇴', decimals: 2 },
    BGN: { name: 'Bulgarian Lev',       symbol: 'лв',  flag: '🇧🇬', decimals: 2 },
    ISK: { name: 'Icelandic Króna',     symbol: 'kr',  flag: '🇮🇸', decimals: 0 },
    // Middle Eastern currencies
    AED: { name: 'UAE Dirham',          symbol: 'AED', flag: '🇦🇪', decimals: 2 },
    SAR: { name: 'Saudi Riyal',         symbol: 'SAR', flag: '🇸🇦', decimals: 2 },
    QAR: { name: 'Qatari Riyal',        symbol: 'QAR', flag: '🇶🇦', decimals: 2 },
    KWD: { name: 'Kuwaiti Dinar',       symbol: 'KWD', flag: '🇰🇼', decimals: 3 },
    BHD: { name: 'Bahraini Dinar',      symbol: 'BHD', flag: '🇧🇭', decimals: 3 },
    OMR: { name: 'Omani Rial',          symbol: 'OMR', flag: '🇴🇲', decimals: 3 },
    JOD: { name: 'Jordanian Dinar',     symbol: 'JOD', flag: '🇯🇴', decimals: 3 },
    EGP: { name: 'Egyptian Pound',      symbol: 'E£',  flag: '🇪🇬', decimals: 2 },
    IQD: { name: 'Iraqi Dinar',         symbol: 'IQD', flag: '🇮🇶', decimals: 3 },
    LBP: { name: 'Lebanese Pound',      symbol: 'L£',  flag: '🇱🇧', decimals: 2 },
  },
};

/**
 * Build a lookup from any symbol/code string → currency code.
 * Multi-char symbols take precedence.
 */
function clBuildSymbolMap() {
  const map = {};
  // Multi-char first (order matters for matching, not for map)
  for (const [sym, code] of Object.entries(CL_CURRENCIES.multiSymbols)) {
    map[sym] = code;
  }
  for (const [sym, code] of Object.entries(CL_CURRENCIES.symbols)) {
    map[sym] = code;
  }
  // Currency codes map to themselves
  for (const code of Object.keys(CL_CURRENCIES.codes)) {
    map[code] = code;
  }
  return map;
}

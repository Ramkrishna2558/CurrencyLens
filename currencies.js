/**
 * MudraLens - Shared currency configuration.
 * Loaded by content scripts (via manifest) and background (via importScripts).
 */

/* eslint-disable no-unused-vars */
const CL_CURRENCIES = {
  // Maps single-character symbols to default currency code
  symbols: {
    '$': 'USD',
    '\u20AC': 'EUR',
    '\u00A3': 'GBP',
    '\u00A5': 'JPY',
    '\u20B9': 'INR',
    '\u20A9': 'KRW',
    '\u20BD': 'RUB',
    '\u20AA': 'ILS',
    '\u20B1': 'PHP',
    '\u20BA': 'TRY',
    '\u0E3F': 'THB',
    '\uFDFC': 'SAR'
  },

  // Multi-char symbols - matched BEFORE single-char to avoid partial matches
  multiSymbols: {
    'R$': 'BRL',
    'CA$': 'CAD',
    'A$': 'AUD',
    'NZ$': 'NZD',
    'HK$': 'HKD',
    'S$': 'SGD',
    'MX$': 'MXN',
    'RM': 'MYR',
    'Rp': 'IDR',
    'Ft': 'HUF',
    'zl': 'PLN',
    'Kc': 'CZK',
    'kr': 'SEK',
    'lei': 'RON',
    'CHF': 'CHF',
    'AED': 'AED',
    'SAR': 'SAR',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'BHD': 'BHD',
    'OMR': 'OMR',
    'JOD': 'JOD'
  },

  codes: {
    USD: { name: 'US Dollar', symbol: '$', decimals: 2 },
    EUR: { name: 'Euro', symbol: '\u20AC', decimals: 2 },
    GBP: { name: 'British Pound', symbol: '\u00A3', decimals: 2 },
    JPY: { name: 'Japanese Yen', symbol: '\u00A5', decimals: 0 },
    INR: { name: 'Indian Rupee', symbol: '\u20B9', decimals: 2 },
    CAD: { name: 'Canadian Dollar', symbol: 'CA$', decimals: 2 },
    AUD: { name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
    CHF: { name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
    CNY: { name: 'Chinese Yuan', symbol: '\u00A5', decimals: 2 },
    SEK: { name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
    KRW: { name: 'South Korean Won', symbol: '\u20A9', decimals: 0 },
    SGD: { name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
    NOK: { name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
    MXN: { name: 'Mexican Peso', symbol: 'MX$', decimals: 2 },
    BRL: { name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
    DKK: { name: 'Danish Krone', symbol: 'kr', decimals: 2 },
    PLN: { name: 'Polish Zloty', symbol: 'zl', decimals: 2 },
    THB: { name: 'Thai Baht', symbol: '\u0E3F', decimals: 2 },
    IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 0 },
    HUF: { name: 'Hungarian Forint', symbol: 'Ft', decimals: 0 },
    CZK: { name: 'Czech Koruna', symbol: 'Kc', decimals: 2 },
    ILS: { name: 'Israeli Shekel', symbol: '\u20AA', decimals: 2 },
    PHP: { name: 'Philippine Peso', symbol: '\u20B1', decimals: 2 },
    TRY: { name: 'Turkish Lira', symbol: '\u20BA', decimals: 2 },
    ZAR: { name: 'South African Rand', symbol: 'R', decimals: 2 },
    MYR: { name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
    RON: { name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
    BGN: { name: 'Bulgarian Lev', symbol: 'lv', decimals: 2 },
    ISK: { name: 'Icelandic Krona', symbol: 'kr', decimals: 0 },
    AED: { name: 'UAE Dirham', symbol: 'AED', decimals: 2 },
    SAR: { name: 'Saudi Riyal', symbol: 'SAR', decimals: 2 },
    QAR: { name: 'Qatari Riyal', symbol: 'QAR', decimals: 2 },
    KWD: { name: 'Kuwaiti Dinar', symbol: 'KWD', decimals: 3 },
    BHD: { name: 'Bahraini Dinar', symbol: 'BHD', decimals: 3 },
    OMR: { name: 'Omani Rial', symbol: 'OMR', decimals: 3 },
    JOD: { name: 'Jordanian Dinar', symbol: 'JOD', decimals: 3 },
    EGP: { name: 'Egyptian Pound', symbol: 'E\u00A3', decimals: 2 },
    IQD: { name: 'Iraqi Dinar', symbol: 'IQD', decimals: 3 },
    LBP: { name: 'Lebanese Pound', symbol: 'L\u00A3', decimals: 2 }
  }
};

/**
 * Build a lookup from any symbol/code string to currency code.
 * Multi-char symbols take precedence.
 */
function clBuildSymbolMap() {
  const map = {};
  for (const [sym, code] of Object.entries(CL_CURRENCIES.multiSymbols)) map[sym] = code;
  for (const [sym, code] of Object.entries(CL_CURRENCIES.symbols)) map[sym] = code;
  for (const code of Object.keys(CL_CURRENCIES.codes)) map[code] = code;
  return map;
}

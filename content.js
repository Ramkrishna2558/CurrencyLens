/**
 * XRate — Content Script
 * Detects prices in page text, converts them using cached rates,
 * and injects a subtle badge next to each price.
 */

(() => {
  'use strict';

  /* ========== State ========== */
  const PROCESSED_ATTR = 'data-cl-processed';
  const BADGE_CLASS    = 'cl-converted';
  const DEBUG = false;     // Set to true to enable debug logging
  let settings = { enabled: true, targetCurrency: 'EUR' };
  let rates = null;        // { USD: 1, EUR: 0.92, … }
  let symbolMap = null;    // { '$': 'USD', '€': 'EUR', … }
  let observer = null;
  let debounceTimer = null;
  let processedCount = 0;  // Track how many prices we've processed

  /* ========== Number Parsing ========== */

  /**
   * Parse a localised number string into a float.
   * Handles US (1,234.56), EU (1.234,56), and plain (1234) formats.
   */
  function parseLocalNumber(str) {
    str = str.trim();
    if (!str) return NaN;

    const lastComma  = str.lastIndexOf(',');
    const lastPeriod = str.lastIndexOf('.');

    // If both exist, determine which is decimal separator
    if (lastComma !== -1 && lastPeriod !== -1) {
      if (lastComma > lastPeriod) {
        // European: 1.234.567,89  →  comma is decimal
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      } else {
        // US/UK/Indian: 1,234,567.89 or 12,34,567.89  →  period is decimal
        return parseFloat(str.replace(/,/g, ''));
      }
    }

    if (lastComma !== -1 && lastPeriod === -1) {
      // Only commas — decide by digit count after last comma
      const afterComma = str.substring(lastComma + 1);
      // If 1-2 digits after comma, it's decimal; if 3, it's thousands
      if (afterComma.length <= 2) {
        return parseFloat(str.replace(/,/g, '.'));  // treat as decimal
      }
      return parseFloat(str.replace(/,/g, ''));     // treat as thousands
    }

    if (lastPeriod !== -1 && lastComma === -1) {
      // Only periods
      const periodCount = (str.match(/\./g) || []).length;
      if (periodCount > 1) {
        // Multiple periods = thousands separators (e.g. 1.234.567)
        return parseFloat(str.replace(/\./g, ''));
      }
      return parseFloat(str); // single period = decimal
    }

    return parseFloat(str);
  }

  /* ========== Regex Construction ========== */

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function buildPriceRegex() {
    // Order multi-char before single-char so 'R$' matches before '$'
    const allSymbols = [
      ...Object.keys(CL_CURRENCIES.multiSymbols),
      ...Object.keys(CL_CURRENCIES.symbols),
    ];
    const symPattern = allSymbols.map(escapeRegex).join('|');

    const allCodes = Object.keys(CL_CURRENCIES.codes).join('|');
    // Allow whitespace + bidi control chars used on RTL sites (e.g. Noon)
    const sep = '[\\s\\u00A0\\u200E\\u200F\\u061C\\u2066-\\u2069]*';

    // Number pattern:
    //  - US/Indian grouped: 1,234,567.89 | 12,34,567.89
    //  - EU grouped:        1.234.567,89
    //  - Plain:             1234 | 4098.95 | 0,99
    const num =
      '(?:\\d{1,3}(?:,\\d{2,3})+(?:\\.\\d{1,2})?' +
      '|\\d{1,3}(?:\\.\\d{3})+(?:,\\d{1,2})?' +
      '|\\d+(?:[,.]\\d{1,2})?)';

    // Four flavours:
    //  1) symbol then number        $100
    //  2) number then symbol        100€
    //  3) code then number          USD 100
    //  4) number then code          100 USD
    return new RegExp(
      '(?:(' + symPattern + ')' + sep + '(' + num + '))' +      // groups 1,2
      '|(?:(' + num + ')' + sep + '(' + symPattern + '))' +      // groups 3,4
      '|(?:\\b(' + allCodes + ')' + sep + '(' + num + '))' +     // groups 5,6
      '|(?:(' + num + ')' + sep + '(' + allCodes + ')\\b)',      // groups 7,8
      'g'
    );
  }

  /* ========== Conversion ========== */

  function convert(amount, fromCode, toCode) {
    if (!rates || !rates[fromCode] || !rates[toCode]) return null;
    if (fromCode === toCode) return null; // no self-conversion
    return (amount / rates[fromCode]) * rates[toCode];
  }

  function formatConverted(amount, currencyCode) {
    const meta = CL_CURRENCIES.codes[currencyCode];
    const decimals = meta ? meta.decimals : 2;
    const symbol = meta ? meta.symbol : currencyCode;

    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${symbol}${formatted}`;
  }

  /* ========== DOM Processing ========== */

  // Tags to skip entirely
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'SELECT',
    'CODE', 'PRE', 'SVG', 'CANVAS', 'IMG', 'VIDEO', 'AUDIO', 'IFRAME',
  ]);

  function shouldSkip(node) {
    if (!node || !node.parentElement) return true;
    const parent = node.parentElement;
    if (SKIP_TAGS.has(parent.tagName)) return true;
    if (parent.isContentEditable) return true;
    if (parent.classList.contains(BADGE_CLASS)) return true;
    if (parent.hasAttribute(PROCESSED_ATTR)) return true;
    return false;
  }

  function createBadge(text) {
    const span = document.createElement('span');
    span.className = BADGE_CLASS;
    span.textContent = ` (~ ${text})`;
    span.title = 'Converted by XRate';
    return span;
  }

  
  function extractFirstPrice(text) {
    const regex = buildPriceRegex();
    const m = regex.exec(text);
    if (!m) return null;

    if (m[1] !== undefined) return { currencyStr: m[1], numStr: m[2] };
    if (m[3] !== undefined) return { currencyStr: m[4], numStr: m[3] };
    if (m[5] !== undefined) return { currencyStr: m[5], numStr: m[6] };
    if (m[7] !== undefined) return { currencyStr: m[8], numStr: m[7] };
    return null;
  }

  function getCandidateText(node) {
    if (!node) return '';
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.nodeValue || '').trim();
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    if (node.classList?.contains(BADGE_CLASS)) return '';
    if (node.hasAttribute?.(PROCESSED_ATTR)) return '';
    if (SKIP_TAGS.has(node.tagName)) return '';
    if (node.children && node.children.length > 0) return '';
    return (node.textContent || '').trim();
  }

  function processSplitSiblingPairs(root = document.body) {
    if (!root || !settings.enabled || !rates) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    const parents = [root];
    while (walker.nextNode()) parents.push(walker.currentNode);

    for (const parent of parents) {
      if (!parent || !parent.childNodes || parent.childNodes.length < 2) continue;
      if (parent.classList?.contains(BADGE_CLASS)) continue;
      if (parent.hasAttribute?.(PROCESSED_ATTR)) continue;
      if (SKIP_TAGS.has(parent.tagName)) continue;

      for (let i = 0; i < parent.childNodes.length - 1; i++) {
        const a = parent.childNodes[i];
        const b = parent.childNodes[i + 1];
        if (!a || !b) continue;
        if (a.nodeType === Node.ELEMENT_NODE && a.classList?.contains(BADGE_CLASS)) continue;
        if (b.nodeType === Node.ELEMENT_NODE && b.classList?.contains(BADGE_CLASS)) continue;
        if (a.nodeType === Node.ELEMENT_NODE && a.hasAttribute?.(PROCESSED_ATTR)) continue;
        if (b.nodeType === Node.ELEMENT_NODE && b.hasAttribute?.(PROCESSED_ATTR)) continue;

        const t1 = getCandidateText(a);
        const t2 = getCandidateText(b);
        if (!t1 || !t2) continue;
        if (t1.length > 20 || t2.length > 20) continue;

        const parsed = extractFirstPrice(`${t1} ${t2}`) || extractFirstPrice(`${t1}${t2}`);
        if (!parsed) continue;

        const fromCode = symbolMap[parsed.currencyStr];
        if (!fromCode) continue;

        const amount = parseLocalNumber(parsed.numStr);
        if (isNaN(amount) || amount <= 0 || amount > 1e12) continue;

        const converted = convert(amount, fromCode, settings.targetCurrency);
        if (converted === null) continue;

        const wrapper = document.createElement('span');
        wrapper.setAttribute(PROCESSED_ATTR, '1');
        parent.insertBefore(wrapper, a);
        wrapper.appendChild(a);
        wrapper.appendChild(b);
        parent.insertBefore(createBadge(formatConverted(converted, settings.targetCurrency)), wrapper.nextSibling);

        i++;
      }
    }
  }

  /**
   * Process a single text node: find prices, inject badges.
   */
  function processTextNode(textNode) {
    if (shouldSkip(textNode)) return;

    const text = textNode.nodeValue;
    if (!text || text.trim().length < 2) return;

    const regex = buildPriceRegex();
    const matches = [];
    let m;

    // Debug: Log text nodes containing price-like patterns
    if (DEBUG && /[0-9]{2,}/.test(text) && /[€$£¥₹฿]/.test(text)) {
      console.log('[XRate Debug] Checking text:', text.substring(0, 100));
    }

    while ((m = regex.exec(text)) !== null) {
      let currencyStr, numStr;

      if (m[1] !== undefined) {        // symbol before number
        currencyStr = m[1]; numStr = m[2];
      } else if (m[3] !== undefined) {  // number before symbol
        numStr = m[3]; currencyStr = m[4];
      } else if (m[5] !== undefined) {  // code before number
        currencyStr = m[5]; numStr = m[6];
      } else if (m[7] !== undefined) {  // number before code
        numStr = m[7]; currencyStr = m[8];
      } else {
        continue;
      }

      const fromCode = symbolMap[currencyStr];
      if (!fromCode) {
        if (DEBUG) console.log('[XRate Debug] Unknown currency symbol:', currencyStr);
        continue;
      }

      const amount = parseLocalNumber(numStr);
      if (isNaN(amount) || amount <= 0 || amount > 1e12) {
        if (DEBUG) console.log('[XRate Debug] Invalid amount:', numStr, '→', amount);
        continue;
      }

      const converted = convert(amount, fromCode, settings.targetCurrency);
      if (converted === null) {
        if (DEBUG) console.log('[XRate Debug] Conversion failed:', amount, fromCode, '→', settings.targetCurrency);
        continue;
      }

      if (DEBUG) {
        processedCount++;
        console.log(`[XRate Debug] Match #${processedCount}:`, {
          original: m[0],
          from: `${currencyStr} ${amount} (${fromCode})`,
          to: `${formatConverted(converted, settings.targetCurrency)} (${settings.targetCurrency})`
        });
      }

      matches.push({
        index: m.index,
        length: m[0].length,
        badge: formatConverted(converted, settings.targetCurrency),
      });
    }

    if (matches.length === 0) return;

    // Replace text node with fragments including badges
    const frag = document.createDocumentFragment();
    let cursor = 0;

    for (const match of matches) {
      // Text before this match
      if (match.index > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }
      // The original price text
      const priceSpan = document.createElement('span');
      priceSpan.setAttribute(PROCESSED_ATTR, '1');
      priceSpan.textContent = text.slice(match.index, match.index + match.length);
      frag.appendChild(priceSpan);
      // The conversion badge
      frag.appendChild(createBadge(match.badge));

      cursor = match.index + match.length;
    }

    // Remaining text
    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  }

  /**
   * Walk the DOM tree and process all text nodes.
   */
  function scanDocument(root = document.body) {
    if (!root || !settings.enabled || !rates) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    // Collect nodes first to avoid modifying tree while walking
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      processTextNode(node);
    }

    processSplitSiblingPairs(root);
  }

  /* ========== Remove existing badges (for re-scan or disable) ========== */

  function removeBadges() {
    document.querySelectorAll('.' + BADGE_CLASS).forEach(el => el.remove());
    document.querySelectorAll(`[${PROCESSED_ATTR}]`).forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
  }

  /* ========== MutationObserver for dynamic content ========== */

  function setupObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver(mutations => {
      if (!settings.enabled) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains(BADGE_CLASS)) {
              scanDocument(node);
            } else if (node.nodeType === Node.TEXT_NODE) {
              processTextNode(node);
            }
          }
        }
      }, 300);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ========== Initialisation ========== */

  async function init() {
    symbolMap = clBuildSymbolMap();

    // Fetch settings
    try {
      const s = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      if (s) settings = s;
    } catch { /* use defaults */ }

    // Fetch rates with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    async function fetchRatesWithRetry() {
      try {
        const data = await chrome.runtime.sendMessage({ type: 'GET_RATES' });
        if (data && data.rates) {
          rates = data.rates;
          return true;
        }
      } catch (e) {
        console.warn('[XRate] Failed to fetch rates:', e);
      }
      return false;
    }

    // Try to fetch rates immediately
    const success = await fetchRatesWithRetry();
    
    // If failed and we have retries left, try again
    if (!success && retryCount < maxRetries) {
      setTimeout(async () => {
        retryCount++;
        const retrySuccess = await fetchRatesWithRetry();
        if (retrySuccess && settings.enabled) {
          scanDocument();
          setupObserver();
        }
      }, retryDelay);
    }

    // Proceed if we have rates and extension is enabled
    if (settings.enabled && rates) {
      scanDocument();
      setupObserver();
    } else if (settings.enabled && !rates) {
      // Set up observer anyway so dynamic content will be processed when rates arrive
      setupObserver();
    }
  }

  // React to live setting changes from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'SETTINGS_CHANGED') {
      settings = { ...settings, ...msg.settings };
      removeBadges();
      if (settings.enabled && rates) {
        scanDocument();
        setupObserver();
      } else if (observer) {
        observer.disconnect();
      }
    }
  });

  // Listen for storage changes (e.g., when rates are fetched)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.cl_rates) {
      const newRates = changes.cl_rates.newValue;
      if (newRates && newRates.rates) {
        rates = newRates.rates;
        // If extension is enabled and we just got rates, scan the document
        if (settings.enabled && !observer) {
          scanDocument();
          setupObserver();
        } else if (settings.enabled) {
          // Rates updated, re-scan everything
          removeBadges();
          scanDocument();
        }
      }
    }
  });

  // Go
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

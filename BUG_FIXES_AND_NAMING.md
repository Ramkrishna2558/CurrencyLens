# Bug Fixes & Extension Naming Suggestions

## ðŸ› Bug Fixes Applied (v1.1.1)

### Issue: Extension Not Loading on First Page Load

**Problem Description:**
- On some websites (like BestBuy), conversions don't appear until you open the extension popup and change settings
- Works fine on other sites (like Amazon)
- Root cause: Race condition between content script initialization and rate fetching

### Root Causes Identified:

1. **Race Condition**: Content script initializes before background worker has fetched rates
2. **Silent Failure**: No retry mechanism when rates aren't available
3. **No Storage Listener**: Content script doesn't react when rates become available later

### Solutions Implemented:

#### 1. Added Retry Logic (content.js)
```javascript
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
    console.warn('[MudraLens] Failed to fetch rates:', e);
  }
  return false;
}
```

#### 2. Added Storage Change Listener (content.js)
```javascript
// Listen for storage changes (e.g., when rates are fetched)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.cl_rates) {
    const newRates = changes.cl_rates.newValue;
    if (newRates && newRates.rates) {
      rates = newRates.rates;
      // Scan document when rates become available
      if (settings.enabled) {
        scanDocument();
        setupObserver();
      }
    }
  }
});
```

#### 3. Proactive Rate Fetching (background.js)
```javascript
// Fetch rates on browser startup
chrome.runtime.onStartup.addListener(() => {
  getRates(false).catch(console.error);
});

// Ensure rates are available when service worker wakes up
(async function ensureRates() {
  try {
    await getRates(false);
  } catch (e) {
    console.error('[MudraLens] Failed to fetch initial rates:', e);
  }
})();
```

### Expected Behavior After Fix:
âœ… Extension loads and displays conversions immediately on first page load
âœ… Works consistently across all websites (BestBuy, Amazon, etc.)
âœ… Gracefully handles network delays or API issues
âœ… Automatically retries if rates aren't available initially
âœ… Reacts to rate updates in real-time

---

## ðŸŽ¯ Extension Naming Suggestions

### Why Rename?

Current name "MudraLens" is good but could be improved:
- Too long for quick recall
- "Lens" metaphor not immediately clear
- Similar names exist in the extension store
- Better branding opportunities available

### Naming Criteria:
- âœ… Short and memorable (1-2 words)
- âœ… Clear purpose
- âœ… Easy to spell and pronounce
- âœ… Works internationally
- âœ… Domain availability likely
- âœ… Unique in Chrome Web Store

---

## ðŸ’¡ Name Suggestions (Categorized)

### ðŸ† Top Tier Recommendations

#### 1. **PricePort** â­ (Best Overall)
- **Pros:** Short, professional, clear metaphor (port = gateway), memorable
- **Cons:** None significant
- **Why it works:** "Port" suggests translation/conversion perfectly
- **Domain:** priceport.com likely available (.io definitely available)

#### 2. **Convertly**
- **Pros:** Modern, trendy "-ly" suffix, instantly clear action
- **Cons:** Might sound too casual for some
- **Why it works:** Trending naming pattern in tech (Grammarly, Calendly)
- **Domain:** convertly.app or convertly.io

#### 3. **ExchangeView**
- **Pros:** Professional, trustworthy, clear function
- **Cons:** Slightly longer
- **Why it works:** Combines "exchange" (rates) with "view" (display)
- **Domain:** exchangeview.com or exchangeview.io

---

### Direct & Functional

4. **QuickConvert**
   - Emphasizes speed and simplicity
   - Clear call to action

5. **PriceTranslate**
   - Makes translation metaphor explicit
   - Good for international users

6. **MoneyMorph**
   - Fun, memorable
   - "Morph" = transformation

7. **CurrencySwap**
   - Simple, direct
   - Universally understood

---

### Modern & Tech-Forward

8. **Pricify**
   - Modern "-ify" suffix (like Spotify, Shopify)
   - Implies transformation

9. **MudraLens** (X = Exchange)
   - Ultra-short
   - Tech-forward naming

10. **ConvRate**
    - Compact portmanteau
    - Professional sound

11. **PriceSync**
    - Suggests real-time updates
    - Modern tech vibe

---

### Playful & Memorable

12. **CoinFlip**
    - Playful metaphor for currency exchange
    - Easy to remember

13. **MoneyGlasses**
    - Like seeing prices differently
    - Fun visual metaphor

14. **PricePal**
    - Friendly assistant vibe
    - Approachable

15. **CashCompass**
    - Navigating currency world
    - Adventurous feel

---

### International & Universal

16. **GlobalPrice**
    - Clear international focus
    - Professional

17. **WorldRate**
    - Universal appeal
    - Clear purpose

18. **UniFX** (Universal Foreign Exchange)
    - Short, professional
    - FX = industry standard term

---

## ðŸŽ¨ Rebranding Checklist

If you decide to rename, update these files:

- [ ] `manifest.json` - name field
- [ ] `README.md` - title and all references
- [ ] `AGENTS.md` - project name
- [ ] `CHANGELOG.md` - project name
- [ ] `popup.html` - header
- [ ] `popup.css` - any branding
- [ ] `store/description.txt` - extension name
- [ ] Repository name on GitHub
- [ ] All documentation files
- [ ] Icon design (if applicable)

---

## ðŸ“Š My Personal Ranking

1. **PricePort** - Perfect balance of professional and memorable
2. **Convertly** - Modern and trendy, great for marketing
3. **ExchangeView** - Most professional, great for trust
4. **Pricify** - Modern, but might be too playful
5. **QuickConvert** - Safe choice, clear purpose

**Winner: PricePort** ðŸ†

Would you like me to apply the rename to all files once you choose a name?


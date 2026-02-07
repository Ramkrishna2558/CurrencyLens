/**
 * XRate — Background Service Worker
 * Fetches exchange rates from open.er-api.com (free, no API key, supports 160+ currencies).
 * Caches rates in chrome.storage.local with a configurable TTL.
 */

importScripts('currencies.js');

const API_BASE = 'https://open.er-api.com/v6';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/* ---------- Rate fetching & caching ---------- */

async function fetchRates() {
  const url = `${API_BASE}/latest/USD`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  if (data.result !== 'success') {
    throw new Error('API returned error status');
  }

  // Use rates directly (USD is already base with value 1)
  const rates = data.rates;
  const cache = { 
    rates, 
    date: new Date(data.time_last_update_unix * 1000).toISOString().split('T')[0],
    fetchedAt: Date.now() 
  };

  await chrome.storage.local.set({ cl_rates: cache });
  return cache;
}

async function getRates(forceRefresh = false) {
  if (!forceRefresh) {
    const stored = await chrome.storage.local.get('cl_rates');
    if (stored.cl_rates && Date.now() - stored.cl_rates.fetchedAt < CACHE_TTL_MS) {
      return stored.cl_rates;
    }
  }
  return fetchRates();
}

/* ---------- Settings helpers ---------- */

async function getSettings() {
  const defaults = { enabled: true, targetCurrency: 'EUR' };
  const stored = await chrome.storage.local.get('cl_settings');
  return { ...defaults, ...stored.cl_settings };
}

/* ---------- Message handling ---------- */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'GET_RATES') {
    getRates(msg.force).then(sendResponse).catch(e => sendResponse({ error: e.message }));
    return true; // async
  }
  if (msg.type === 'GET_SETTINGS') {
    getSettings().then(sendResponse);
    return true;
  }
  if (msg.type === 'SET_SETTINGS') {
    chrome.storage.local.set({ cl_settings: msg.settings }).then(() => {
      // Notify all tabs so content scripts react immediately
      chrome.tabs.query({}, tabs => {
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_CHANGED', settings: msg.settings }).catch(() => {});
        }
      });
      sendResponse({ ok: true });
    });
    return true;
  }
});

/* ---------- Install / startup ---------- */

chrome.runtime.onInstalled.addListener(() => {
  // Pre-fetch rates on install
  getRates(true).catch(console.error);
});

// Also fetch rates on browser startup
chrome.runtime.onStartup.addListener(() => {
  getRates(false).catch(console.error);
});

// Ensure rates are available when service worker wakes up
(async function ensureRates() {
  try {
    await getRates(false);
  } catch (e) {
    console.error('[XRate] Failed to fetch initial rates:', e);
  }
})();

/**
 * CurrencyLens — Popup Script
 */

const $toggle   = document.getElementById('enableToggle');
const $currency = document.getElementById('targetCurrency');
const $rateDate = document.getElementById('rateDate');
const $refresh  = document.getElementById('refreshBtn');
const $status   = document.getElementById('status');

/* ---------- Populate currency dropdown ---------- */

function populateDropdown(selectedCode) {
  $currency.innerHTML = '';
  const codes = Object.keys(CL_CURRENCIES.codes).sort((a, b) => {
    return CL_CURRENCIES.codes[a].name.localeCompare(CL_CURRENCIES.codes[b].name);
  });
  for (const code of codes) {
    const meta = CL_CURRENCIES.codes[code];
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${meta.flag} ${code} — ${meta.name}`;
    if (code === selectedCode) opt.selected = true;
    $currency.appendChild(opt);
  }
}

/* ---------- Save settings ---------- */

async function saveSettings() {
  const settings = {
    enabled: $toggle.checked,
    targetCurrency: $currency.value,
  };
  await chrome.runtime.sendMessage({ type: 'SET_SETTINGS', settings });
  showStatus($toggle.checked ? 'Active' : 'Paused');
}

function showStatus(msg, isError = false) {
  $status.textContent = msg;
  $status.className = 'status' + (isError ? ' error' : '');
  setTimeout(() => { $status.textContent = ''; }, 2000);
}

/* ---------- Refresh rates ---------- */

async function refreshRates() {
  $refresh.disabled = true;
  $rateDate.textContent = 'Updating…';
  try {
    const data = await chrome.runtime.sendMessage({ type: 'GET_RATES', force: true });
    if (data.error) throw new Error(data.error);
    updateRateInfo(data);
    showStatus('Rates updated');
  } catch (e) {
    showStatus('Update failed: ' + e.message, true);
  } finally {
    $refresh.disabled = false;
  }
}

function updateRateInfo(data) {
  if (!data || !data.date) {
    $rateDate.textContent = 'No rate data';
    return;
  }
  const fetchedDate = new Date(data.fetchedAt);
  const timeStr = fetchedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $rateDate.textContent = `ECB ${data.date} · fetched ${timeStr}`;
}

/* ---------- Init ---------- */

async function init() {
  // Load current settings
  const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
  $toggle.checked = settings.enabled;
  populateDropdown(settings.targetCurrency);

  // Load rate info
  try {
    const data = await chrome.runtime.sendMessage({ type: 'GET_RATES' });
    if (data && !data.error) updateRateInfo(data);
    else $rateDate.textContent = 'No rate data yet';
  } catch {
    $rateDate.textContent = 'Unable to fetch rates';
  }

  // Events
  $toggle.addEventListener('change', saveSettings);
  $currency.addEventListener('change', saveSettings);
  $refresh.addEventListener('click', refreshRates);
}

init();

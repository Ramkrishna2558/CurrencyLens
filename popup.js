/**
 * MudraLens - Popup Script
 */

const $toggle   = document.getElementById('enableToggle');
const $currencyDropdown = document.getElementById('currencyDropdown');
const $currencyTrigger = document.getElementById('currencyTrigger');
const $currencyLabel = document.getElementById('currencyLabel');
const $currencyMenu = document.getElementById('currencyMenu');
const $rateDate = document.getElementById('rateDate');
const $refresh  = document.getElementById('refreshBtn');
const $status   = document.getElementById('status');
let selectedCurrency = 'EUR';

/* ---------- Populate currency dropdown ---------- */

function populateDropdown(selectedCode) {
  $currencyMenu.innerHTML = '';
  selectedCurrency = selectedCode;
  const codes = Object.keys(CL_CURRENCIES.codes).sort((a, b) => {
    return CL_CURRENCIES.codes[a].name.localeCompare(CL_CURRENCIES.codes[b].name);
  });

  function formatCurrency(code) {
    const meta = CL_CURRENCIES.codes[code];
    return `${code} - ${meta.name}`;
  }

  $currencyLabel.textContent = formatCurrency(selectedCode);

  for (const code of codes) {
    const meta = CL_CURRENCIES.codes[code];
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'dropdown-item' + (code === selectedCode ? ' selected' : '');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', code === selectedCode ? 'true' : 'false');
    item.textContent = `${code} - ${meta.name}`;
    item.addEventListener('click', async () => {
      selectedCurrency = code;
      $currencyLabel.textContent = formatCurrency(code);
      closeDropdown();
      await saveSettings();
      populateDropdown(selectedCurrency);
    });
    $currencyMenu.appendChild(item);
  }
}

function openDropdown() {
  $currencyMenu.hidden = false;
  $currencyDropdown.classList.add('open');
  $currencyTrigger.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  $currencyMenu.hidden = true;
  $currencyDropdown.classList.remove('open');
  $currencyTrigger.setAttribute('aria-expanded', 'false');
}

/* ---------- Save settings ---------- */

async function saveSettings() {
  const settings = {
    enabled: $toggle.checked,
    targetCurrency: selectedCurrency,
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
  $rateDate.textContent = 'Syncing rates...';
  try {
    const data = await chrome.runtime.sendMessage({ type: 'GET_RATES', force: true });
    if (data.error) throw new Error(data.error);
    updateRateInfo(data);
    showStatus('Synced');
  } catch (e) {
    showStatus('Sync failed', true);
  } finally {
    $refresh.disabled = false;
  }
}

function updateRateInfo(data) {
  if (!data || !data.date) {
    $rateDate.textContent = 'Rates unavailable';
    return;
  }
  $rateDate.textContent = 'Rates ready';
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
    else $rateDate.textContent = 'Rates unavailable';
  } catch {
    $rateDate.textContent = 'Rates unavailable';
  }

  // Events
  $toggle.addEventListener('change', saveSettings);
  $refresh.addEventListener('click', refreshRates);
  $currencyTrigger.addEventListener('click', () => {
    if ($currencyMenu.hidden) openDropdown();
    else closeDropdown();
  });
  document.addEventListener('click', (e) => {
    if (!$currencyDropdown.contains(e.target)) closeDropdown();
  });
}

init();



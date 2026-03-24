/**
 * FlipLink – Instant Link Previews
 * Production-ready PWA with CORS proxy fallback chain,
 * preview history, and install-to-home-screen support.
 */

/* ── DOM References ── */

const form        = document.getElementById('preview-form');
const urlInput    = document.getElementById('url-input');
const card        = document.getElementById('preview-card');
const previewImg  = document.getElementById('preview-image');
const domainEl    = document.getElementById('preview-domain');
const titleEl     = document.getElementById('preview-title');
const descEl      = document.getElementById('preview-description');
const linkEl      = document.getElementById('preview-link');
const errorEl     = document.getElementById('error-msg');
const loadingEl   = document.getElementById('loading');
const historySection = document.getElementById('history-section');
const historyList    = document.getElementById('history-list');
const clearHistBtn   = document.getElementById('clear-history');
const installBanner  = document.getElementById('install-banner');
const installBtn     = document.getElementById('install-btn');
const installDismiss = document.getElementById('install-dismiss');

/* ── Constants ── */

const MAX_HISTORY = 10;
const STORAGE_KEY = 'fliplink_history';

const PROXY_ENDPOINTS = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

/* ── Helpers ── */

function setVisible(el, visible) {
  el.classList.toggle('hidden', !visible);
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseMeta(html, url) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');

  const og      = (prop) => doc.querySelector(`meta[property="og:${prop}"]`)?.getAttribute('content');
  const twitter = (name) => doc.querySelector(`meta[name="twitter:${name}"]`)?.getAttribute('content');
  const meta    = (name) => doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content');

  const image = og('image') || twitter('image') || '';
  let resolvedImage = '';
  if (image) {
    try {
      resolvedImage = new URL(image, url).href;
    } catch {
      resolvedImage = image;
    }
  }

  return {
    title:       og('title')       || twitter('title')       || doc.title || extractDomain(url),
    description: og('description') || twitter('description') || meta('description') || '',
    image:       resolvedImage,
  };
}

/* ── Proxy Fetch with Fallbacks ── */

async function fetchViaProxy(url) {
  let lastError;

  for (const buildUrl of PROXY_ENDPOINTS) {
    try {
      const proxyUrl = buildUrl(url);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        const html = data.contents || data;
        if (!html) throw new Error('Empty response');
        return typeof html === 'string' ? html : JSON.stringify(html);
      }

      return await response.text();
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All proxy endpoints failed');
}

/* ── History ── */

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch { /* quota exceeded — silently ignore */ }
}

function addToHistory(url, meta) {
  const entries = loadHistory();
  const existing = entries.findIndex((e) => e.url === url);
  if (existing !== -1) entries.splice(existing, 1);

  entries.unshift({
    url,
    title: meta.title,
    image: meta.image,
    domain: extractDomain(url),
    ts: Date.now()
  });

  if (entries.length > MAX_HISTORY) entries.length = MAX_HISTORY;
  saveHistory(entries);
  renderHistory();
}

function renderHistory() {
  const entries = loadHistory();
  if (!entries.length) {
    setVisible(historySection, false);
    return;
  }

  setVisible(historySection, true);
  historyList.innerHTML = '';

  for (const entry of entries) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <button class="history-link" data-url="${entry.url}" title="${entry.title}">
        <span class="history-domain">${entry.domain}</span>
        <span class="history-title">${entry.title}</span>
      </button>`;
    historyList.appendChild(li);
  }
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
}

/* ── Main Preview Logic ── */

async function fetchPreview(rawUrl) {
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  setVisible(loadingEl, true);
  setVisible(card,      false);
  setVisible(errorEl,   false);

  try {
    const html = await fetchViaProxy(url);
    const meta = parseMeta(html, url);

    domainEl.textContent = extractDomain(url);
    titleEl.textContent  = meta.title;
    descEl.textContent   = meta.description;
    linkEl.href          = url;

    if (meta.image) {
      previewImg.src = meta.image;
      previewImg.alt = meta.title;
      setVisible(previewImg, true);
      previewImg.onerror = () => setVisible(previewImg, false);
    } else {
      setVisible(previewImg, false);
    }

    setVisible(loadingEl, false);
    setVisible(card,      true);

    addToHistory(url, meta);
  } catch (err) {
    setVisible(loadingEl, false);
    errorEl.textContent = navigator.onLine
      ? 'Could not load preview. Please check the URL and try again.'
      : 'You appear to be offline. Connect to the internet and try again.';
    setVisible(errorEl, true);
  }
}

/* ── PWA Install Prompt ── */

let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  setVisible(installBanner, true);
});

installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  setVisible(installBanner, false);
});

installDismiss?.addEventListener('click', () => {
  setVisible(installBanner, false);
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  setVisible(installBanner, false);
  deferredPrompt = null;
});

/* ── Service Worker Registration ── */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

/* ── Event Listeners ── */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (url) fetchPreview(url);
});

historyList?.addEventListener('click', (e) => {
  const btn = e.target.closest('.history-link');
  if (!btn) return;
  const url = btn.dataset.url;
  urlInput.value = url;
  fetchPreview(url);
});

clearHistBtn?.addEventListener('click', clearHistory);

/* ── Init ── */
renderHistory();

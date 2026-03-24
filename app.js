/**
 * FlipLink – Preview
 * Fetches Open Graph / meta data for any URL and renders a live preview card.
 *
 * Uses the free allorigins.win CORS proxy so the fetch works from a static page
 * hosted on any domain (or opened as a local file).
 */

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
  // Resolve relative image URLs against the target origin
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

/* ── Main Preview Logic ── */

async function fetchPreview(rawUrl) {
  // Normalise URL
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  // Show loading state
  setVisible(loadingEl, true);
  setVisible(card,      false);
  setVisible(errorEl,   false);

  try {
    // allorigins.win returns { contents: "<html>...</html>", status: {...} }
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (!data.contents) throw new Error('Empty response from proxy');

    const meta = parseMeta(data.contents, url);

    // Populate card
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
  } catch (err) {
    setVisible(loadingEl, false);
    errorEl.textContent = 'Could not load preview. Please check the URL and try again.';
    setVisible(errorEl, true);
  }
}

/* ── Event Listeners ── */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (url) fetchPreview(url);
});

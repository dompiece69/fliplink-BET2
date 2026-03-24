# FlipLink

A lightweight, zero-dependency **link preview** PWA.
Paste any URL and instantly see its Open Graph title, description, and image — right in the browser.

**Installable** on any device via the browser's "Add to Home Screen" or the in-app install banner.

## Features

- **Instant previews** — extracts Open Graph, Twitter Card, and standard meta tags
- **Installable PWA** — works as a standalone app on mobile and desktop
- **Offline shell** — app UI loads even without a connection (service worker cached)
- **Preview history** — recently previewed links are saved locally for quick re-access
- **Resilient fetching** — falls back through multiple CORS proxies automatically
- **Dark theme** — beautiful gradient UI, fully responsive down to 320 px

## Quick Start

```bash
# Serve with any static file server
python -m http.server 8080
# then open http://localhost:8080
```

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell, PWA meta tags, structured markup |
| `style.css` | Dark-theme styling, responsive layout, animations |
| `app.js` | Proxy-fetch chain, OG parsing, history, install prompt, SW registration |
| `manifest.json` | PWA web app manifest (name, icons, theme, display mode) |
| `sw.js` | Service worker — caches static assets for offline use |
| `icons/` | App icons at 72–512 px for home screen, splash, and store listings |

## How It Works

1. User pastes a URL and taps **Preview**.
2. `app.js` tries up to three CORS proxy services in sequence (allorigins → codetabs → corsproxy.io).
3. The returned HTML is parsed client-side for `og:*`, `twitter:*`, and `<meta name>` tags.
4. A rich preview card is rendered with image, title, description, and a "Visit Site" link.
5. The URL is saved to `localStorage` history for one-tap re-preview.

## PWA / App Store

FlipLink is a Progressive Web App. To distribute via app stores:

- **Google Play** — wrap with [Bubblewrap](https://github.com/nicollassilva/nicollassilva/nicollassilva/) or [PWABuilder](https://www.pwabuilder.com/) to generate a Trusted Web Activity (TWA) APK.
- **Apple App Store** — wrap in a WKWebView shell using Xcode or use [PWABuilder](https://www.pwabuilder.com/) for an iOS package.
- **Microsoft Store** — submit directly via [PWABuilder](https://www.pwabuilder.com/) or package as an MSIX.

The `manifest.json` and service worker already satisfy installability criteria for all major browsers.

## License

MIT

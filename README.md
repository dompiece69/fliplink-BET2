# fliplink-BET2

A lightweight, zero-dependency **link preview** tool.  
Paste any URL and instantly see its Open Graph title, description, and image – right in the browser.

## Usage

1. Open `index.html` in any modern browser (or serve it with any static file server).
2. Type or paste a URL into the input field.
3. Click **Preview** – a card with the site's metadata appears immediately.

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell and markup |
| `style.css`  | Dark-theme styling |
| `app.js`     | Fetch + Open Graph parsing logic |

## How it works

`app.js` proxies the request through [allorigins.win](https://allorigins.win) to bypass
CORS restrictions, then parses the returned HTML for `og:*` and `twitter:*` meta tags to
build the preview card.

## Running locally

```bash
# Python 3
python -m http.server 8080
# then open http://localhost:8080
```
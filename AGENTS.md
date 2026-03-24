# AGENTS.md

## Cursor Cloud specific instructions

### Overview

FlipLink is a zero-dependency, zero-build static web application (HTML + CSS + vanilla JS). It previews Open Graph metadata for any URL using the `allorigins.win` CORS proxy.

### Running the dev server

Serve the repo root with any static file server. The README suggests:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

### Key caveats

- **QUIC protocol must be disabled in Chrome.** The cloud VM network blocks QUIC/HTTP3 traffic to `api.allorigins.win`. Before testing in Chrome, navigate to `chrome://flags/#enable-quic`, set "Experimental QUIC protocol" to **Disabled**, and relaunch. Without this, every preview request will fail with `ERR_QUIC_PROTOCOL_ERROR`.
- The CORS proxy (`api.allorigins.win`) is an external third-party service. It works reliably for simple sites (e.g. `example.com`) but may return HTTP 502 for some major sites (e.g. `github.com`) due to anti-scraping measures or proxy-side rate limits. This is not a bug in the application.
- There is no build step, no linter, no test suite, and no package manager. The project consists of three files: `index.html`, `style.css`, `app.js`.

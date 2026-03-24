# AGENTS.md

## Cursor Cloud specific instructions

### Overview

**FlipLink** is a zero-dependency, static front-end link preview tool. There are no build steps, no package managers, and no backend services to install. The entire app is three files: `index.html`, `style.css`, `app.js`.

### Running the app

Serve the project root with any static HTTP server. The README documents:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

### Key caveats

- **External CORS proxy dependency**: The app relies on `https://api.allorigins.win` to proxy URL fetches and bypass CORS. This third-party service may be slow, rate-limited, or unreachable from cloud VMs. Preview failures are caused by this external dependency, not by the app code.
- **No linter/test/build tooling**: This project has no `package.json`, no test framework, no linter config, and no build system. There is nothing to lint, test, or build beyond serving the static files.
- **No hot-reload**: The Python HTTP server does not hot-reload. Refresh the browser manually after editing files.

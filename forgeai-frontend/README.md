# SE Browser Agent — UI refresh

This folder contains the refreshed frontend for the five existing screens:

- `dashboard.html` — dashboard and recent projects
- `new_task.html` — task configuration
- `tasks.html` — task orchestration and run history
- `agent_workspace.html` — live agent workspace
- `code.html` — task prompt / engineering run interface

## What changed

- Added `assets/forgeai-ui.css` as a shared visual system for consistent colors, typography, component states, borders, and focus styles.
- Kept the original dark neo-brutalist identity, with the yellow/cyan terminal accents, while reducing visual noise and improving contrast and spacing.
- Unified the sidebar/header geometry across pages and tuned the code screen to the shared layout.
- Added responsive mobile navigation and stacking behavior for the multi-panel workspace.
- Wired the existing sidebar links to the available HTML screens and meaningful in-page anchors.
- Preserved the existing page scripts and task UI. No backend/API integration or application logic was added.

## Run locally

From this directory, start a basic static server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/dashboard.html` in your browser. The original pages still load Tailwind CSS, Google Fonts, and Material Symbols from their existing CDN URLs, so an internet connection is needed for those external assets.

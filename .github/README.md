# `.github/` — automation

## Workflows

| File | Trigger | Action |
|------|---------|--------|
| [`workflows/deploy-pages.yml`](workflows/deploy-pages.yml) | Push to `main`, `workflow_dispatch` | `npm ci` → `npm test` → `npm run build` (`VITE_BASE_PATH=/Music-Theory/`) → deploy `dist/` to `gh-pages` |

Published site: https://davevoyles.github.io/Music-Theory/

Pages source must remain: branch **`gh-pages`**, folder **`/`**.

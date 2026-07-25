# Music Theory

Interactive music-theory workspace for advanced guitarists: Circle of Fifths, guitar fretboard mapping, aural feedback, and modular song analysis.

**Status:** Plan 0001 in progress (scaffold + shell on main once D1 lands).

## Docs

- [Plan 0001](docs/design/0001-interactive-music-theory-app.md)
- [ADR 0001 — PixiJS dual-view](docs/decisions/0001-pixijs-for-circle-and-fretboard.md)
- [ADR 0002 — SongAnalyzerProvider](docs/decisions/0002-song-analyzer-provider.md)
- [ADR 0003 — Phased mock analyzer](docs/decisions/0003-phased-mock-analyzer.md)
- [Glossary](CONTEXT.md)

## Stack (locked)

React + Vite + TypeScript · PixiJS v8 · Zustand · Tone.js · GitHub Pages (`gh-pages` via Actions)

## Develop

```bash
npm install
npm run dev
```

### Production build & base path

GitHub Pages project URL requires a non-root Vite `base` (default `/Music-Theory/`).

```bash
# Pages-shaped build (default)
npm run build

# Root hosting / local static preview without subpath
VITE_BASE_PATH=/ npm run build
npm run preview
```

Set `VITE_BASE_PATH` at CI deploy time if the site path changes.

## Layout chrome (D1)

Desktop-first dark shell:

| Region | Role |
|--------|------|
| Left | Circle of Fifths (+ roman / minor-form slot) |
| Right / bottom | Fretboard |
| Bottom | Collapsible song analyzer |

## Issues

https://github.com/DaveVoyles/Music-Theory/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0001

## GitHub Pages deploy

CI workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds on every push to `main` (and `workflow_dispatch`) and publishes `dist/` to the `gh-pages` branch with Vite base `/Music-Theory/`.

1. **Enable Pages** in repo Settings → Pages → Source: **Deploy from a branch** → branch `gh-pages` / `/ (root)`.
2. Site URL (after first successful run): `https://davevoyles.github.io/Music-Theory/`
3. Private repos need GitHub Pro (or a public repo) for GitHub Pages hosting.
4. Override base path only if the site path changes: set `VITE_BASE_PATH` in the workflow Build step.


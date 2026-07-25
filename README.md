# Music Theory

Interactive music-theory workspace for advanced guitarists: Circle of Fifths, guitar fretboard mapping, aural feedback, and modular song analysis.

**Status:** Plan 0001 v1 complete on `main` (visual + audio + mock analyzer). Live HTTP analysis is a follow-on.

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
npm test
npm run build
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

## Layout

| Region | Role |
|--------|------|
| Left | Dual-ring Circle of Fifths + roman strip + minor form |
| Right | EADGBE fretboard (0–12), diatonic labels, power-string emphasis |
| Bottom | Collapsible mock song analyzer |

## Manual E2E checklist (D10)

1. Cold load → header shows **C major** / all diatonic.
2. Click outer CoF majors rapidly → fret labels + header update; hear tonic triad after first gesture.
3. Click inner minor → minor-form control appears; switch harmonic → G# appears in A minor.
4. Focus roman **V** → only V chord tones bright on the neck; **All** or re-tap clears.
5. Open analyzer → pick a fixture → section click jumps CoF + neck + clears degree focus.
6. Reload page → last key/mode/minor form restored from localStorage.

## GitHub Pages deploy

CI workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds on every push to `main` (and `workflow_dispatch`) and publishes `dist/` to the `gh-pages` branch with Vite base `/Music-Theory/`.

1. **Enable Pages** in repo Settings → Pages → Source: **Deploy from a branch** → branch `gh-pages` / `/ (root)`.
2. Site URL (after first successful run): `https://davevoyles.github.io/Music-Theory/`
3. Private repos need GitHub Pro (or a public repo) for GitHub Pages hosting.
4. Override base path only if the site path changes: set `VITE_BASE_PATH` in the workflow Build step.

## Issues

https://github.com/DaveVoyles/Music-Theory/issues?q=is%3Aissue+label%3Aplan%3A0001

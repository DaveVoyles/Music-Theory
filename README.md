# Music Theory

Interactive music-theory workspace for advanced guitarists: dual-ring **Circle of Fifths**, **guitar fretboard** mapping, **aural feedback**, and a modular **song analyzer**.

**Live site:** [https://davevoyles.github.io/Music-Theory/](https://davevoyles.github.io/Music-Theory/)

**Status:** Plan 0001 v1 complete (visual + audio + mock analyzer). Live LLM analysis via `HttpProvider` is the intentional next phase.

---

## For agents (start here)

This section is the onboarding brief. Read it before editing.

### What this app is

A **static SPA** (GitHub Pages). One Zustand **theory store** is the source of truth for key/mode/minor form/degree focus. Pixi views and React controls **subscribe** to that store; they do not invent parallel state.

```
UI (React + Pixi)
  CoF · Fretboard · Roman/minor controls · Analyzer
           │
           ▼
   useTheoryStore (Zustand + localStorage)
           │
     ┌─────┴─────┐
     ▼           ▼
  theory/     analyzer/  (MockProvider | HttpProvider)
  cof/ audio/ fretboard/   domain DTO only — no vendor SDKs in UI
```

### Non-negotiables (locked decisions)

| Area | Rule |
|------|------|
| Stack | React + Vite + TypeScript · PixiJS v8 · Zustand · Tone.js |
| Hosting | Static GH Pages only — **no secrets in the client bundle** |
| Theory | Pure functions in `src/theory/` — **no React imports** |
| Analyzer | `SongAnalyzerProvider` interface; UI depends on **DTO**, not chat APIs |
| Audio | Tone starts only inside a **user gesture** (`theoryAudio.prime`) |
| Spellings | Key-aware ♯/♭ via theory engine |
| Neck | Standard EADGBE, frets 0–12; emphasize Low E / A / D |

See `docs/design/0001-interactive-music-theory-app.md` and ADRs under `docs/decisions/`. Domain terms: [`CONTEXT.md`](CONTEXT.md).

### How to change things safely

1. **Theory math** → `src/theory/` + tests in `theory.test.ts` (TDD surface).
2. **Store shape / persistence** → `src/store/theoryStore.ts` + store tests.
3. **CoF layout / selection mapping** → pure data in `src/cof/`, Pixi paint in `components/CircleOfFifths.tsx`.
4. **Neck map** → pure data in `src/fretboard/neck.ts`, Pixi paint in `components/Fretboard.tsx`.
5. **Audio** → `src/audio/theoryAudio.ts` (injectable Tone mock for tests).
6. **Song analysis** → `src/analyzer/` providers; panel is `components/AnalyzerPanel.tsx`.
7. **Chrome / layout CSS** → `App.tsx` / `App.css` / `index.css`.

Prefer **extending pure modules** over growing imperative Pixi files. Keep Pixi components as thin renderers over pure maps.

### Commands

```bash
npm install
npm run dev          # local Vite dev server
npm test             # Vitest (all unit tests)
npm run lint         # oxlint
npm run build        # tsc -b && vite build (Pages base default)
VITE_BASE_PATH=/ npm run build && npm run preview   # root-base local preview
```

### GitHub Pages

- Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
- On push to `main`: test → build with `VITE_BASE_PATH=/Music-Theory/` → publish `dist/` to `gh-pages`
- Site: **https://davevoyles.github.io/Music-Theory/**
- Vite `base` defaults to `/Music-Theory/` in `vite.config.ts` — wrong base → broken asset URLs

---

## Repository map

```
Music Theory/
├── README.md                 ← you are here
├── CONTEXT.md                ← ubiquitous language / glossary
├── package.json              ← scripts + deps
├── vite.config.ts            ← base path + Vitest
├── index.html
├── public/                   ← static assets (favicon)
├── .github/workflows/        ← CI deploy to gh-pages
├── docs/
│   ├── design/               ← plan 0001 (approved)
│   ├── decisions/            ← ADRs
│   └── learnings.md          ← orchestration retros
└── src/
    ├── main.tsx / App.tsx    ← shell + layout chrome
    ├── theory/               ← pure music-theory engine
    ├── store/                ← Zustand theory UI store
    ├── cof/                  ← Circle of Fifths pure data
    ├── fretboard/            ← neck map pure data
    ├── audio/                ← Tone.js wrapper
    ├── analyzer/             ← providers + fixtures + DTO
    └── components/           ← React/Pixi views
```

Each `src/*` package has its own **README.md** describing files and extension points.

---

## UI layout

| Region | Contents |
|--------|----------|
| Header | Title, live key badge (mode / minor form / degree focus) |
| Left | Dual-ring CoF (Pixi), minor-form control, roman strip |
| Right | Fretboard (Pixi), diatonic labels, root + power-string emphasis |
| Bottom | Collapsible analyzer (search fixtures → section timeline → key jump) |

---

## Architecture notes for implementers

### Data flow (key change)

1. User clicks CoF wedge **or** analyzer section **or** (future) external API.
2. `useTheoryStore.getState().selectKey(...)` updates key/mode (and clears `focusDegree` on jump).
3. CoF re-paints selection; fretboard rebuilds neck via `buildNeck(toKeyRef(state), focusDegree)`.
4. CoF click also calls `theoryAudio.playTriad`; fret note click calls `playPitch`.

### Testing seams (plan 0001)

| Package | What to test |
|---------|----------------|
| `theory/` | Pitch math, spellings, minor forms 6/7, chord tones |
| `store/` | Defaults, setters, localStorage rehydrate, focus clear on jump |
| `cof/` / `fretboard/` | Pure selection / neck maps |
| `audio/` | Note names + triad; Tone mocked |
| `analyzer/` | Mock fixtures + HttpProvider URL building (no secrets) |

Run `npm test` before every PR. Do not rely on real Web Audio or WebGL in CI.

### Import conventions

- Prefer package barrels: `from '../theory'`, `from '../store'`, `from '../analyzer'`.
- UI must not import Tone or fetch secrets directly — go through `audio/` and `analyzer/`.
- `*.test.ts` is excluded from app `tsc` build (`tsconfig.app.json`).

---

## Manual smoke checklist

1. Cold load → **C major**, all diatonic.
2. Rapid CoF major clicks → header + frets update; triad after first gesture.
3. Inner minor → minor-form control; harmonic raises 7 (e.g. A minor → G#).
4. Roman **V** → chord-tone focus; **All** / re-tap clears.
5. Analyzer fixture → section click jumps workspace key and clears degree focus.
6. Reload → theory UI restored from localStorage.

---

## Out of scope (v1) — do not re-open without a plan

- Live cloud LLM keys in the client
- Alternate tunings / >12 frets / left-handed neck
- Phone-first parity
- Amp sims / sample packs
- User accounts

---

## Docs & issues

| Doc | Purpose |
|-----|---------|
| [Plan 0001](docs/design/0001-interactive-music-theory-app.md) | Deliverables, testing decisions, execution map |
| [ADR 0001](docs/decisions/0001-pixijs-for-circle-and-fretboard.md) | Pixi for CoF + fretboard |
| [ADR 0002](docs/decisions/0002-song-analyzer-provider.md) | SongAnalyzerProvider contract |
| [ADR 0003](docs/decisions/0003-phased-mock-analyzer.md) | Mock-first analyzer phasing |
| [Learnings](docs/learnings.md) | Orchestration / implementation notes |
| [Glossary](CONTEXT.md) | Domain terms |

Issues (plan 0001 archive):  
https://github.com/DaveVoyles/Music-Theory/issues?q=label%3Aplan%3A0001

## Next improvements

Prioritized post-v1 ideas: [`docs/improvements.md`](docs/improvements.md) (HttpProvider UI wiring, a11y, E2E smoke, lazy load, etc.).

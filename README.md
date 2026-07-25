# Music Theory

**Interactive practice + teaching workspace for guitarists** — pick a key on the Circle of Fifths, see it on the neck, hear the triads, read *why* the key signature has those sharps or flats, drill with a quiz, and jump keys from song-section demos.

| | |
|---|---|
| **Live app** | [https://davevoyles.github.io/Music-Theory/](https://davevoyles.github.io/Music-Theory/) |
| **Repo** | [github.com/DaveVoyles/Music-Theory](https://github.com/DaveVoyles/Music-Theory) |
| **Stack** | React · Vite · TypeScript · PixiJS v8 · Zustand · Tone.js |
| **Host** | Static site on **GitHub Pages** (no backend secrets in the client) |
| **Status** | Plan 0001 complete; pedagogy layer (lessons + quiz + ear training) live; HTTP song analysis is the intentional next phase |

---

## Table of contents

1. [What is this?](#what-is-this)
2. [Features](#features)
3. [How it works](#how-it-works)
4. [Quick start](#quick-start)
5. [UI map](#ui-map)
6. [Repository layout](#repository-layout)
7. [Architecture](#architecture)
8. [Testing](#testing)
9. [GitHub Pages / deploy](#github-pages--deploy)
10. [Docs & decisions](#docs--decisions)
11. [For agents / contributors](#for-agents--contributors)
12. [Out of scope (v1)](#out-of-scope-v1)
13. [Roadmap ideas](#roadmap-ideas)

---

## What is this?

Most theory tools either **show a diagram** or **play notes**. This app keeps **one shared theory state** (key, mode, minor form, degree focus) and drives **everything** from it:

- **Explore** — click keys and frets; the rest of the workspace follows.
- **Hear** — tonic triads, degree triads, and single pitches (browser audio after a click).
- **Learn** — live panels explain key signatures and scale-degree *functions*, not only labels.
- **Check** — a quiz reuses the same teaching facts for active recall.
- **Apply** — fixture song sections jump the workspace to real-form keys (mock analyzer today).

It targets **guitarists** who already know some theory and want a **synced visual + aural** lab: standard EADGBE, frets 0–12, power-string emphasis (Low E / A / D).

Domain vocabulary lives in [`CONTEXT.md`](CONTEXT.md) (e.g. dual-ring CoF, focus degree, minor form, `SongAnalyzerProvider`).

---

## Features

### Circle of Fifths (dual ring)

- **Outer ring** = major keys; **inner ring** = relative minors (same signature, different tonic).
- Click a wedge → sets global key/mode, highlights the major/minor pair, plays the **tonic triad**.
- Clockwise ≈ more sharps; counter-clockwise ≈ more flats.

### Key signature lesson

Updates whenever the key changes:

- How many sharps or flats, **which notes** (staff order).
- Scale with accidentals highlighted.
- **Why** (fifths from C + scale-pattern intuition).
- **Remember** (order-of-sharps / flats mnemonics).
- Relative major/minor pair that share the signature.

### Roman degrees + degree function lesson

- **I–vii°** strip filters the fretboard to that chord’s tones.
- Selecting a degree **plays the degree triad** and opens a lesson: function family (tonic / subdominant / dominant…), chord tones, why it pulls, try-this progressions.
- Minor form (natural / harmonic / melodic) changes degrees 6/7, roman qualities, sound, and copy.

### Guitar fretboard

- Standard **EADGBE**, frets **0–12**.
- Diatonic labels; **root in gold**; Low E/A/D drawn stronger for power-chord practice.
- Click a lit note → pitch; non-diatonic frets stay dim.

### Theory quiz

- Multiple choice: signature counts, accidentals, degree names, chord tones.
- Score + explanation after each answer.
- **Show on workspace** jumps the Circle, neck, and lessons to that key/degree.

### Song analyzer (mock)

- Search fixture songs, open a timeline of sections (chords + romans).
- Click a section → workspace key/mode jumps; degree focus clears.
- Architecture is provider-based (`MockProvider` now; `HttpProvider` stub for a future gateway — **no API keys in the SPA**).

### Help tooltips

Hover/focus **?** next to major regions for What / How / Try this copy (`src/help/featureHelp.ts`).

### Persistence

Key, mode, minor form, and degree focus restore from **localStorage** after reload.

---

## How it works

```
┌─────────────────────────────────────────────────────────────┐
│  UI (React + Pixi)                                          │
│  CoF · KeyLesson · RomanStrip · DegreeLesson · Fretboard    │
│  Quiz · Analyzer · HelpTip                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ subscribe / dispatch
                            ▼
              useTheoryStore (Zustand + localStorage)
              key · keySpelling · mode · minorForm · focusDegree
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     theory/           audio/            analyzer/
   pure math        Tone (gesture)     Mock | Http DTO
   lessons/quiz     prime → play
     cof/ fretboard pure geometry maps
```

1. User action (CoF wedge, roman button, analyzer section, quiz “Show on workspace”).
2. Store updates (`selectKey`, `toggleFocusDegree`, …).
3. Views re-render from store + pure helpers (`keySignatureInfo`, `buildNeck`, `degreeLessonInfo`, …).
4. Audio only starts after a **user gesture** (`theoryAudio.prime` inside play paths).

**Rules of the road**

| Concern | Rule |
|---------|------|
| Theory | Pure TypeScript in `src/theory/` — **no React** |
| UI state | One Zustand store — views do not invent parallel key state |
| Analyzer | UI depends on **domain DTOs**, not vendor chat SDKs |
| Secrets | Never ship OpenAI/Anthropic/etc. keys in the Vite bundle |
| Pixi | Thin paint over pure data (`cof/`, `fretboard/`) |

---

## Quick start

```bash
git clone https://github.com/DaveVoyles/Music-Theory.git
cd Music-Theory
npm install
npm run dev          # local Vite server (usually http://localhost:5173)
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR |
| `npm test` | Vitest unit suite |
| `npm run lint` | oxlint |
| `npm run build` | `tsc -b` + production build (Pages base `/Music-Theory/`) |
| `npm run preview` | Preview production build |
| `VITE_BASE_PATH=/ npm run build && npm run preview` | Root-base local preview |

**Try in the browser**

1. Open the live site or `npm run dev`.
2. Click **G** on the outer Circle → key badge, neck, and key-signature lesson update (1 sharp: F#).
3. Tap **V** on the roman strip → hear the dominant triad, neck filters, degree lesson explains.
4. Expand **Quiz** under the fretboard → answer one; use **Show on workspace**.
5. Expand **Analyzer** → open a fixture song → click **Chorus** → key jumps.

---

## UI map

```
┌─ Header ────────────────────────────────────────────────────┐
│  Music Theory [?]     ·  live key badge (mode / form / focus) │
├──────────────────────┬──────────────────────────────────────┤
│  Circle of Fifths    │  Fretboard (EADGBE · frets 0–12)      │
│  Key signature lesson│  Quiz (collapsible)                  │
│  Minor form (if min) │                                      │
│  Degrees I–vii°      │                                      │
│  Degree function     │                                      │
├──────────────────────┴──────────────────────────────────────┤
│  Analyzer (collapsible) · fixture search · section timeline │
└─────────────────────────────────────────────────────────────┘
```

| Region | What you get |
|--------|----------------|
| **Header** | Title, help, current key / minor form / degree focus |
| **Left column** | CoF, key-signature teaching, roman strip, degree teaching |
| **Right column** | Neck map + quiz |
| **Bottom** | Song analyzer (fixtures → section → key jump) |

---

## Repository layout

```
Music-Theory/
├── README.md                 ← this file
├── CONTEXT.md                ← domain glossary (ubiquitous language)
├── package.json              ← scripts + dependencies
├── vite.config.ts            ← Vite base path + Vitest
├── index.html
├── public/                   ← favicon / static assets
├── .github/workflows/        ← CI: test → build → deploy gh-pages
├── docs/
│   ├── design/               ← plan 0001 (approved deliverables)
│   ├── decisions/            ← ADRs (Pixi, analyzer provider, mock phase)
│   ├── improvements.md       ← post-v1 backlog
│   └── learnings.md          ← implementation notes
└── src/
    ├── main.tsx              ← React entry
    ├── App.tsx / App.css     ← shell layout + chrome styles
    ├── index.css             ← design tokens (colors, base type scale)
    ├── theory/               ← pure music-theory + teaching engines
    ├── store/                ← Zustand theory UI store
    ├── cof/                  ← Circle of Fifths pure data
    ├── fretboard/            ← neck map pure data
    ├── audio/                ← Tone.js wrapper (gesture prime)
    ├── analyzer/             ← providers, fixtures, DTOs
    ├── help/                 ← FEATURE_HELP catalog for tooltips
    └── components/           ← React + Pixi views
```

### `src/` packages (what lives where)

| Path | Role | Start here |
|------|------|------------|
| [`src/theory/`](src/theory/) | Pitch classes, scales, key-aware spellings, chord tones, romans, **`keySignatureInfo`**, **`degreeLessonInfo`**, **quiz generators** | [`theory/README.md`](src/theory/README.md) |
| [`src/store/`](src/store/) | `useTheoryStore`: key, spelling, mode, minor form, focus degree; localStorage | [`store/README.md`](src/store/README.md) |
| [`src/cof/`](src/cof/) | Dual-ring positions, wedge selection, relative pairs (no Pixi) | [`cof/README.md`](src/cof/README.md) |
| [`src/fretboard/`](src/fretboard/) | `buildNeck` map: diatonic, root, chord-tone focus, power emphasis | [`fretboard/README.md`](src/fretboard/README.md) |
| [`src/audio/`](src/audio/) | `theoryAudio`: prime, pitch, tonic triad, **degree triad** | [`audio/README.md`](src/audio/README.md) |
| [`src/analyzer/`](src/analyzer/) | `SongAnalyzerProvider`, Mock + Http stubs, fixtures, types | [`analyzer/README.md`](src/analyzer/README.md) |
| [`src/help/`](src/help/) | Feature help copy for `HelpTip` | [`help/README.md`](src/help/README.md) |
| [`src/components/`](src/components/) | Shell pieces: CoF, Fretboard, lessons, quiz, analyzer, tips | [`components/README.md`](src/components/README.md) |

### Important theory modules

| File | Responsibility |
|------|----------------|
| `pitch.ts` | Pitch-class arithmetic, spelling parse |
| `scales.ts` | Major + natural/harmonic/melodic minor intervals |
| `spellings.ts` | Key-aware note names, relatives |
| `degrees.ts` | Chord tones, roman numerals |
| `keySignature.ts` | Accidental counts + teaching copy |
| `degreeLesson.ts` | Function names, roles, why / try this |
| `quiz.ts` | Multiple-choice generators (seedable RNG for tests) |

### Important UI components

| Component | Responsibility |
|-----------|----------------|
| `CircleOfFifths.tsx` | Pixi dual-ring; click → store + tonic triad |
| `Fretboard.tsx` | Pixi neck; click → pitch |
| `KeyLesson.tsx` | Live key-signature teaching panel |
| `RomanStrip.tsx` | Degree focus + degree-triad audio |
| `DegreeLesson.tsx` | Function lesson + Hear triad |
| `QuizPanel.tsx` | Active recall + workspace jump |
| `AnalyzerPanel.tsx` | Fixture search / timeline / section jump |
| `HelpTip.tsx` | Accessible ? popovers |
| `MinorFormControl.tsx` | Natural / harmonic / melodic |

### Docs tree

| Path | Purpose |
|------|---------|
| [`docs/design/0001-…`](docs/design/0001-interactive-music-theory-app.md) | Original product plan + deliverables |
| [`docs/decisions/`](docs/decisions/) | Architecture Decision Records |
| [`docs/improvements.md`](docs/improvements.md) | Ranked backlog (Http UI, a11y, ear quiz, …) |
| [`docs/learnings.md`](docs/learnings.md) | What we learned building plan 0001 |

---

## Architecture

### Data flow (key change)

1. User clicks a CoF wedge **or** analyzer section **or** quiz “Show on workspace”.
2. `selectKey({ key, keySpelling, mode, minorForm? })` runs.
3. On real key/mode change, `focusDegree` is **cleared** so a filter never outlives its key.
4. CoF re-paints selection; fretboard rebuilds via `buildNeck(toKeyRef(state), focusDegree)`.
5. Lessons recompute from pure functions over the same `KeyRef`.

### Data flow (degree focus)

1. User taps **V** (example) on the roman strip.
2. `toggleFocusDegree(5)` → store `focusDegree = 5` (re-tap clears).
3. Fretboard keeps only V chord tones bright.
4. `DegreeLesson` shows dominant teaching; `playDegreeTriad` fires for ear training.

### Import conventions

- Prefer package barrels: `from '../theory'`, `from '../store'`, `from '../analyzer'`.
- UI must **not** import Tone or hardcode cloud secrets — use `audio/` and `analyzer/`.
- `*.test.ts` is excluded from the app `tsc` project (`tsconfig.app.json`).

---

## Testing

```bash
npm test
```

| Package | What unit tests cover |
|---------|------------------------|
| `theory/` | Scales, spellings, minors, chord tones, signatures, degree lessons, quiz |
| `store/` | Defaults, setters, persistence, focus clear on key jump |
| `cof/` / `fretboard/` | Pure geometry / neck maps |
| `audio/` | Note names, triads, degree triads (Tone mocked) |
| `analyzer/` | Fixtures + Http URL building (no real network secrets) |
| `help/` | Feature catalog completeness |

Do **not** rely on real Web Audio or WebGL in CI — inject mocks at package boundaries.

**Manual smoke**

1. Cold load → **C major**, all diatonic.
2. Rapid CoF major clicks → header + frets update; triad after first gesture.
3. Inner minor → minor-form control; harmonic raises 7 (A minor → G#).
4. Roman **V** → hear triad + chord-tone focus + lesson; **All** clears.
5. Quiz → correct/wrong styling readable; Show on workspace jumps key.
6. Analyzer fixture → section click jumps key and clears degree focus.
7. Reload → theory UI restored from localStorage.

---

## GitHub Pages / deploy

- Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
- On push to `main`: **test → build** with `VITE_BASE_PATH=/Music-Theory/` → publish `dist/` to **`gh-pages`**
- Live URL: **https://davevoyles.github.io/Music-Theory/**
- Vite `base` defaults to `/Music-Theory/` in `vite.config.ts` — wrong base → broken asset URLs

---

## Docs & decisions

| Doc | Purpose |
|-----|---------|
| [Plan 0001](docs/design/0001-interactive-music-theory-app.md) | Deliverables, testing decisions, execution map |
| [ADR 0001](docs/decisions/0001-pixijs-for-circle-and-fretboard.md) | Pixi for CoF + fretboard |
| [ADR 0002](docs/decisions/0002-song-analyzer-provider.md) | SongAnalyzerProvider contract |
| [ADR 0003](docs/decisions/0003-phased-mock-analyzer.md) | Mock-first analyzer phasing |
| [Learnings](docs/learnings.md) | Orchestration / implementation notes |
| [Glossary](CONTEXT.md) | Domain terms |
| [Improvements](docs/improvements.md) | Post-v1 ideas |

Plan 0001 issues (archive):  
https://github.com/DaveVoyles/Music-Theory/issues?q=label%3Aplan%3A0001

---

## For agents / contributors

This section is the **onboarding brief** for coding agents and humans shipping PRs.

### How to change things safely

1. **Theory math / teaching facts** → `src/theory/` + matching `*.test.ts` (TDD surface).
2. **Store shape / persistence** → `src/store/theoryStore.ts` + store tests.
3. **CoF layout / selection** → pure data in `src/cof/`, paint in `CircleOfFifths.tsx`.
4. **Neck map** → pure data in `src/fretboard/neck.ts`, paint in `Fretboard.tsx`.
5. **Audio** → `src/audio/theoryAudio.ts` (injectable Tone for tests).
6. **Song analysis** → `src/analyzer/` providers; UI is `AnalyzerPanel.tsx`.
7. **Help copy** → `src/help/featureHelp.ts`.
8. **Chrome / layout / contrast** → `App.tsx`, `App.css`, `index.css`.

Prefer **extending pure modules** over growing imperative Pixi files. Keep Pixi components as thin renderers over pure maps.

### Non-negotiables (locked)

| Area | Rule |
|------|------|
| Stack | React + Vite + TypeScript · PixiJS v8 · Zustand · Tone.js |
| Hosting | Static GH Pages only — **no secrets in the client bundle** |
| Theory | Pure functions in `src/theory/` — **no React imports** |
| Analyzer | `SongAnalyzerProvider` interface; UI depends on **DTO**, not chat APIs |
| Audio | Tone starts only inside a **user gesture** |
| Spellings | Key-aware ♯/♭ via theory engine |
| Neck | Standard EADGBE, frets 0–12; emphasize Low E / A / D |

---

## Out of scope (v1)

Do not re-open without a written plan / ADR:

- Live cloud LLM keys baked into the client
- Alternate tunings / more than 12 frets / left-handed neck
- Phone-first parity (desktop-first layout today)
- Amp sims / sample libraries
- User accounts / cloud sync of practice state

---

## Roadmap ideas

See [`docs/improvements.md`](docs/improvements.md). High-level themes:

- Wire **HttpProvider** UI (gateway URL, offline fallback) for real song analysis
- **Interval lesson** and **ear quiz** (“which degree did you hear?”)
- Staff notation sketch for signatures
- Accessibility: keyboard alternatives for canvas maps
- Lazy-load Pixi / Tone for smaller initial JS

---

## License / ownership

Private or public per the GitHub repo settings. Contributions via PR against `main`; keep tests green (`npm test`) and respect the architecture table above.

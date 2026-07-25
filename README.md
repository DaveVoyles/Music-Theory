# Music Theory

**Interactive practice + teaching workspace for guitarists.** Pick a key on the Circle of Fifths, see it fill the neck, hear triads and progressions, read *why* a signature has those sharps or flats, measure intervals, drill with a quiz (including ear training), and jump keys from song-section demos.

| | |
|---|---|
| **Live app** | [https://davevoyles.github.io/Music-Theory/](https://davevoyles.github.io/Music-Theory/) |
| **Repo** | [github.com/DaveVoyles/Music-Theory](https://github.com/DaveVoyles/Music-Theory) |
| **Stack** | React · Vite · TypeScript · PixiJS v8 · Zustand · Tone.js |
| **Host** | Static site on **GitHub Pages** (no backend secrets in the client) |
| **Tests** | Vitest unit suite (`npm test`) |

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
12. [Out of scope](#out-of-scope)
13. [Roadmap ideas](#roadmap-ideas)

---

## What is this?

Most theory tools either **show a diagram** or **play notes**. This app keeps **one shared theory state** (key, mode, minor form, degree focus, neck labels, interval picks) and drives **everything** from it:

| Mode | What you do |
|------|-------------|
| **Explore** | Click keys and frets; the rest of the workspace follows. |
| **Hear** | Tonic triads, degree triads, fretted pitches in real guitar register, intervals, full progressions. |
| **Learn** | Live panels for key signatures (with staff sketch), degree *functions*, and intervals. |
| **Check** | Quiz reuses the same teaching facts — including “which degree did you hear?” |
| **Apply** | Fixture song sections jump the workspace to real-form keys (mock analyzer today). |

Built for **guitarists** who want a **synced visual + aural** lab: standard **EADGBE**, frets **0–12**, large responsive neck, power-string emphasis (Low E / A / D).

Domain vocabulary lives in [`CONTEXT.md`](CONTEXT.md) (dual-ring CoF, focus degree, minor form, `SongAnalyzerProvider`, etc.).

---

## Features

### Circle of Fifths (dual ring)

- **Outer ring** = major keys; **inner ring** = relative minors (same signature, different tonic).
- Click a wedge → sets global key/mode, highlights the major/minor pair, plays the **tonic triad**.
- Also seeds the **interval lesson** with previous tonic → new tonic (e.g. C → G = perfect fifth).
- Clockwise ≈ more sharps; counter-clockwise ≈ more flats.

### Key signature lesson + staff

Updates whenever the key changes:

- **Treble-staff SVG** with accidentals in engraved order.
- How many sharps or flats, **which notes** (staff order).
- Scale with accidentals highlighted.
- **Why** (fifths from C + scale-pattern intuition).
- **Remember** (order-of-sharps / flats mnemonics).
- Relative major/minor pair that share the signature.

### Roman degrees + degree function lesson

- **I–vii°** strip filters the fretboard to that chord’s tones.
- Selecting a degree **plays the degree triad** and opens a lesson: function family (tonic / subdominant / dominant…), chord tones, why it pulls, try-this progressions.
- Minor form (**natural / harmonic / melodic**) changes degrees 6/7, roman qualities, sound, and copy.

### Progression player

Common diatonic progressions in the current key:

| Mode | Examples |
|------|----------|
| Major | I–V–vi–IV · I–IV–V–I · ii–V–I · I–vi–IV–V |
| Minor | i–VI–III–VII · i–iv–V–i · i–VII–VI–VII |

**Play** sounds each triad in order and focuses that degree on the neck so you can see + hear the cadence.

### Guitar fretboard

- Standard **EADGBE**, frets **0–12**, **fills the main column** (responsive Pixi canvas).
- **Color legend**
  - **Gold** = root (tonic of the selected key)
  - **Green / teal** = notes in the key (scale tones)
  - **Dark** = outside the key
  - **Violet ring** = notes in your interval pick
- Toggle labels: **Note names** ↔ **Degrees 1–7**.
- When a roman degree is focused, non-chord tones dim (still in key, not this chord).
- Low E / A / D drawn thicker for power-chord practice.
- Click frets → **real guitar register** (open low E = E2 … open high e = E4), not a flat mid-range band.
- Click two frets → interval lesson.

### Interval lesson

- Two frets (or two Circle keys) → name (**P5**, **M3**, tritone, …), semitone count, why, try this.
- **Hear interval** plays low → high → both.
- Third fret click keeps the first note and replaces the second.

### Theory quiz (including ear training)

Multiple choice mixed from:

- Signature counts and accidentals  
- Degree function names  
- Chord tones  
- **Ear training**: hear a triad → pick the roman (Replay supported)

After each answer: explanation + optional **Show on workspace** (jumps Circle, neck, and lessons).

### Song analyzer (mock)

- Search fixture songs, open a timeline of sections (chords + romans).
- Click a section → workspace key/mode jumps; degree focus clears.
- Provider-based architecture (`MockProvider` now; `HttpProvider` stub for a future gateway — **no API keys in the SPA**).

### Help tooltips

Hover/focus **?** next to major regions for What / How / Try this (`src/help/featureHelp.ts`).

### Persistence

Key, mode, minor form, degree focus, and neck label mode restore from **localStorage** after reload. Interval picks are session-only.

---

## How it works

```
┌──────────────────────────────────────────────────────────────────┐
│  UI (React + Pixi)                                               │
│  CoF · KeyLesson + Staff · RomanStrip · DegreeLesson             │
│  ProgressionPanel · Fretboard · IntervalLesson · Quiz · Analyzer │
└──────────────────────────────┬───────────────────────────────────┘
                               │ subscribe / dispatch
                               ▼
                 useTheoryStore (Zustand + localStorage)
     key · spelling · mode · minorForm · focusDegree
     neckLabelMode · intervalA/B
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
    theory/               audio/                analyzer/
  pure math            Tone (gesture)         Mock | Http DTO
  lessons / quiz       prime → play
  intervals / staff    pitch / MIDI / triads
  progressions         intervals / progressions
    cof/  fretboard/   pure geometry maps (+ MIDI frets)
```

1. User action (CoF, frets, romans, progression play, analyzer section, quiz).
2. Store updates (`selectKey`, `toggleFocusDegree`, `pickIntervalNote`, …).
3. Views re-render from store + pure helpers (`keySignatureInfo`, `buildNeck`, `intervalInfo`, …).
4. Audio starts only after a **user gesture** (`theoryAudio.prime` inside play paths).

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

1. Open the [live site](https://davevoyles.github.io/Music-Theory/) or `npm run dev`.
2. Click **G** on the outer Circle → badge, neck, key lesson + staff update (1 sharp: F#); interval panel shows C → G.
3. Toggle **Degrees 1–7** on the neck; find all the **5**s.
4. Tap **V** on the roman strip → dominant triad, neck filters, degree lesson.
5. Under **Progression**, play **I–V–vi–IV** and watch the neck focus each chord.
6. Click two frets → interval name + **Hear interval**.
7. Expand **Quiz** → answer one (or an ear item); **Show on workspace**.
8. Expand **Analyzer** → fixture song → **Chorus** → key jumps.

Quiz and analyzer start **collapsed** so the fretboard owns the viewport.

---

## UI map

```
┌─ Header ─────────────────────────────────────────────────────────┐
│  Music Theory [?]     ·  live key badge (mode / form / focus)     │
├────────────────────────┬─────────────────────────────────────────┤
│  Circle of Fifths      │  Fretboard (large · responsive)          │
│  Key signature + staff │    Note names | Degrees 1–7             │
│  Minor form (if min)   │    Legend · interval picks               │
│  Degrees I–vii°        │  Interval lesson                         │
│  Degree function       │  Quiz (collapsible, starts closed)       │
│  Progression player    │                                          │
├────────────────────────┴─────────────────────────────────────────┤
│  Analyzer (collapsible, starts closed) · fixtures · sections      │
└───────────────────────────────────────────────────────────────────┘
```

| Region | What you get |
|--------|----------------|
| **Header** | Title, help, current key / minor form / degree focus |
| **Left column (~30%)** | CoF, key-signature teaching + staff, romans, degree lesson, progressions |
| **Right column (~70%)** | Large neck, interval lesson, quiz |
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
    ├── index.css             ← design tokens
    ├── theory/               ← pure music-theory + teaching engines
    ├── store/                ← Zustand theory UI store
    ├── cof/                  ← Circle of Fifths pure data
    ├── fretboard/            ← neck map + MIDI frets
    ├── audio/                ← Tone.js wrapper (gesture prime)
    ├── analyzer/             ← providers, fixtures, DTOs
    ├── help/                 ← FEATURE_HELP catalog for tooltips
    └── components/           ← React + Pixi views
```

### `src/` packages

| Path | Role | Start here |
|------|------|------------|
| [`src/theory/`](src/theory/) | Pitch, scales, spellings, signatures, degree lessons, **intervals**, **staff layout**, **progressions**, **quiz** (incl. ear) | [`theory/README.md`](src/theory/README.md) |
| [`src/store/`](src/store/) | Key/mode/form/focus, neck label mode, interval picks; localStorage | [`store/README.md`](src/store/README.md) |
| [`src/cof/`](src/cof/) | Dual-ring positions, wedge selection (no Pixi) | [`cof/README.md`](src/cof/README.md) |
| [`src/fretboard/`](src/fretboard/) | `buildNeck`, scale degrees, **`midiAt` / concert register** | [`fretboard/README.md`](src/fretboard/README.md) |
| [`src/audio/`](src/audio/) | Pitch, MIDI, triads, intervals, **progressions** | [`audio/README.md`](src/audio/README.md) |
| [`src/analyzer/`](src/analyzer/) | `SongAnalyzerProvider`, Mock + Http stubs, fixtures | [`analyzer/README.md`](src/analyzer/README.md) |
| [`src/help/`](src/help/) | Feature help copy for `HelpTip` | [`help/README.md`](src/help/README.md) |
| [`src/components/`](src/components/) | Shell: CoF, Fretboard, lessons, quiz, progression, staff, analyzer | [`components/README.md`](src/components/README.md) |

### Theory modules

| File | Responsibility |
|------|----------------|
| `pitch.ts` | Pitch-class arithmetic, spelling parse |
| `scales.ts` | Major + natural/harmonic/melodic minor intervals |
| `spellings.ts` | Key-aware note names, relatives |
| `degrees.ts` | Chord tones, roman numerals |
| `keySignature.ts` | Accidental counts + teaching copy |
| `degreeLesson.ts` | Function names, roles, why / try this |
| `intervals.ts` | Semitone → interval name + lesson copy |
| `staff.ts` | Treble-staff accidental positions for SVG |
| `progressions.ts` | Common major/minor progression presets |
| `quiz.ts` | MC generators + ear-degree questions (seedable RNG) |

### UI components

| Component | Responsibility |
|-----------|----------------|
| `CircleOfFifths.tsx` | Pixi dual-ring; click → store + tonic triad + interval seed |
| `Fretboard.tsx` | Large responsive Pixi neck; labels toggle; MIDI pitches; interval picks |
| `KeyLesson.tsx` | Live key-signature teaching |
| `StaffSignature.tsx` | Treble-staff SVG for the current signature |
| `RomanStrip.tsx` | Degree focus + degree-triad audio |
| `DegreeLesson.tsx` | Function lesson + Hear triad |
| `ProgressionPanel.tsx` | Preset progressions + play / focus sync |
| `IntervalLesson.tsx` | Interval name, why, hear interval |
| `QuizPanel.tsx` | Active recall + ear training + workspace jump |
| `AnalyzerPanel.tsx` | Fixture search / timeline / section jump |
| `HelpTip.tsx` | Accessible ? popovers |
| `MinorFormControl.tsx` | Natural / harmonic / melodic |

### Docs tree

| Path | Purpose |
|------|---------|
| [`docs/design/0001-…`](docs/design/0001-interactive-music-theory-app.md) | Original product plan + deliverables |
| [`docs/decisions/`](docs/decisions/) | Architecture Decision Records |
| [`docs/improvements.md`](docs/improvements.md) | Ranked backlog |
| [`docs/learnings.md`](docs/learnings.md) | Implementation notes |

---

## Architecture

### Data flow (key change)

1. User clicks a CoF wedge **or** analyzer section **or** quiz “Show on workspace”.
2. `selectKey({ key, keySpelling, mode, minorForm? })` runs.
3. On real key/mode change, `focusDegree` is **cleared** so a filter never outlives its key.
4. When the tonic pitch class changes, **intervalA/B** become previous → new tonic.
5. CoF re-paints; fretboard rebuilds via `buildNeck(toKeyRef(state), focusDegree)`.
6. Lessons recompute from pure functions over the same `KeyRef`.

### Data flow (degree focus)

1. User taps **V** on the roman strip (or a progression step lands on V).
2. `toggleFocusDegree` / `setFocusDegree` updates the store.
3. Fretboard keeps only that chord’s tones bright.
4. `DegreeLesson` teaches the role; triad audio may fire.

### Data flow (interval pick)

1. Fret click → `pickIntervalNote` (A, then B, then replace B) + `playMidi`.
2. Or CoF key change seeds A/B from previous/new tonics.
3. `IntervalLesson` calls `intervalInfo(A, B)` for teaching copy; Hear uses `playInterval`.

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
| `theory/` | Scales, spellings, signatures, degree lessons, intervals, staff, progressions, quiz + ear |
| `store/` | Defaults, setters, interval picks, neck label mode, focus clear on key jump, persistence |
| `cof/` / `fretboard/` | Geometry / neck maps / MIDI frets |
| `audio/` | Note names, MIDI, triads, intervals, progressions (Tone mocked) |
| `analyzer/` | Fixtures + Http URL building (no real network secrets) |
| `help/` | Feature catalog completeness |

Do **not** rely on real Web Audio or WebGL in CI — inject mocks at package boundaries.

**Manual smoke**

1. Cold load → **C major**, large neck, quiz/analyzer collapsed.
2. CoF major clicks → header + frets + staff; triad after first gesture; interval C→G on G click.
3. Inner minor → minor-form control; harmonic raises 7 (A minor → G#).
4. Degrees toggle + roman **V** → labels / focus / triad / lesson.
5. Progression play → sequential focus + audio.
6. Two frets → interval panel; Hear interval.
7. Quiz ear item → Replay → answer → Show on workspace.
8. Analyzer fixture → section click jumps key.
9. Reload → theory UI restored from localStorage.

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

### How to change things safely

1. **Theory math / teaching facts** → `src/theory/` + matching `*.test.ts` (TDD surface).
2. **Store shape / persistence** → `src/store/theoryStore.ts` + store tests.
3. **CoF layout / selection** → pure data in `src/cof/`, paint in `CircleOfFifths.tsx`.
4. **Neck map** → pure data in `src/fretboard/neck.ts`, paint in `Fretboard.tsx` (resize-aware).
5. **Audio** → `src/audio/theoryAudio.ts` (injectable Tone for tests).
6. **Song analysis** → `src/analyzer/` providers; UI is `AnalyzerPanel.tsx`.
7. **Help copy** → `src/help/featureHelp.ts` (and featureHelp tests for new IDs).
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
| Neck | Standard EADGBE, frets 0–12; emphasize Low E / A / D; concert MIDI on click |

---

## Out of scope

Do not re-open without a written plan / ADR:

- Live cloud LLM keys baked into the client
- Alternate tunings / more than 12 frets / left-handed neck
- Phone-first parity (desktop-first layout today)
- Amp sims / sample libraries
- User accounts / cloud sync of practice state

---

## Roadmap ideas

See [`docs/improvements.md`](docs/improvements.md). High-level themes still open:

- Wire **HttpProvider** UI (gateway URL, offline fallback) for real song analysis
- **CAGED / box shapes** overlay on the neck
- **Custom progression builder** beyond presets
- Accessibility: keyboard alternatives for canvas maps
- Lazy-load Pixi / Tone for smaller initial JS
- Compact mobile layout

**Shipped since plan 0001** (see improvements.md for detail): key + degree lessons, quiz + ear training, interval lesson, staff sketch, progression player, degree numbers on neck, realistic fretted octaves, large responsive fretboard.

---

## License / ownership

Private or public per the GitHub repo settings. Contributions via PR against `main`; keep tests green (`npm test`) and respect the architecture table above.

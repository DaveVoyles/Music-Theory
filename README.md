# Music Theory

Interactive practice + teaching workspace for guitarists: pick a key, see it on the neck, hear triads/progressions/intervals, learn *why*, and quiz yourself.

| | |
|---|---|
| **Live** | [davevoyles.github.io/Music-Theory](https://davevoyles.github.io/Music-Theory/) |
| **Stack** | React · Vite · TypeScript · PixiJS v8 · Zustand · Tone.js |
| **Host** | GitHub Pages (no client secrets) |

---

## What it does

One shared theory state (key, mode, minor form, degree focus) drives the whole UI:

- **Circle of Fifths** — dual ring (major outer / relative minor inner); click sets key + plays tonic triad
- **Key signature lesson** — sharps/flats, staff sketch, scale, why, mnemonics, relative pair
- **Degrees I–vii°** — filters the neck, plays the triad, teaches function (tonic / dominant / …)
- **Progressions** — I–V–vi–IV, ii–V–I, minor loops, etc.; play with neck focus
- **Fretboard** — EADGBE frets 0–12, large responsive canvas  
  Gold = root · green = in key · dark = outside · violet = interval pick  
  Labels: note names or degrees 1–7 · frets play real guitar register (E2–…)
- **Intervals** — two frets or two CoF keys → name, semitones, hear interval
- **Quiz** — signatures, degrees, ear training (“which triad?”) + jump answer onto workspace
- **Analyzer** — fixture songs; section click jumps key (mock today; HttpProvider later)

Hover **?** icons for What / How / Try this. Key/mode/form/focus/label mode persist in `localStorage`.

---

## Quick start

```bash
git clone https://github.com/DaveVoyles/Music-Theory.git
cd Music-Theory
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # Pages base /Music-Theory/
```

Quiz and analyzer start **collapsed** so the neck owns the screen.

---

## Layout

```
Header · key badge
┌ CoF · key lesson · degrees · progression │ Fretboard (large)
│                                          │ Interval · Quiz
└ Analyzer (bottom, collapsible) ──────────┴──────────────────
```

---

## Repo map

```
src/
  theory/      pure engines: scales, signatures, degrees, intervals, staff, progressions, quiz
  store/       Zustand UI state + localStorage
  cof/         Circle pure data
  fretboard/   neck map + MIDI frets
  audio/       Tone (prime on gesture): pitch, MIDI, triads, intervals, progressions
  analyzer/    Mock + Http providers, fixtures
  help/        tooltip catalog
  components/  React + Pixi views
docs/
  design/      plan 0001
  decisions/   ADRs (Pixi, analyzer provider, mock phase)
  improvements.md
CONTEXT.md     domain glossary
```

**Rules:** theory stays pure (no React) · one store · no API keys in the SPA · audio only after a user gesture · Pixi paints pure maps from `cof/` / `fretboard/`.

---

## Architecture (short)

```
UI ──► useTheoryStore ──► theory/  audio/  analyzer/
         localStorage
```

| Action | Effect |
|--------|--------|
| CoF / analyzer / quiz jump | `selectKey` · clear degree focus · seed interval from prev→new tonic |
| Roman degree | neck chord-tone filter · triad · degree lesson |
| Two frets | interval lesson · `playMidi` (concert pitch) |
| Progression play | sequence of degree triads + focus |

---

## Deploy

Push to `main` → CI tests, builds with `VITE_BASE_PATH=/Music-Theory/`, deploys `dist/` to **gh-pages**.

---

## Docs

| Doc | |
|-----|--|
| [Plan 0001](docs/design/0001-interactive-music-theory-app.md) | Original deliverables |
| [ADRs](docs/decisions/) | Pixi, analyzer provider, mock phase |
| [Improvements](docs/improvements.md) | Backlog (Http UI, CAGED, a11y, mobile…) |
| [CONTEXT.md](CONTEXT.md) | Glossary |

**Still open:** Http song gateway UI, CAGED shapes, custom progression builder, keyboard access for canvases, mobile layout.

**Shipped beyond plan 0001:** lessons, quiz + ear training, intervals, staff, progressions, degree labels, realistic frets, large neck.

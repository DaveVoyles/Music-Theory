# Plan 0001 — Interactive Music Theory App (Guitarists)

**Status:** Approved 2026-07-25  
**Repo:** https://github.com/DaveVoyles/Music-Theory  
**Source:** Grilling session 2026-07-25  
**Companion ADRs:** [0001](../decisions/0001-pixijs-for-circle-and-fretboard.md) · [0002](../decisions/0002-song-analyzer-provider.md) · [0003](../decisions/0003-phased-mock-analyzer.md)

---

## Problem Statement

Advanced guitarists need a **single synced workspace** to internalize keys, scale degrees, and neck geography: an interactive Circle of Fifths, a hardware-accelerated fretboard, aural reinforcement, and (later) song-structure analysis. The product must ship as a **static GitHub Pages** app while keeping an **LLM analysis path modular** for local or cloud gateways.

## Locked Decisions (from grilling)

| Area | Decision |
|------|----------|
| Framework | React + Vite + TypeScript |
| WebGL | PixiJS v8 + `@pixi/react` for Circle **and** fretboard |
| State | Zustand single store |
| Audio | Tone.js — note click → pitch; key click → tonic triad |
| Theory v1 | Major + natural / harmonic / melodic minor |
| Spellings | Key-aware ♯/♭ |
| Fretboard | Standard EADGBE, frets 0–12; emphasize Low E, A, D for power chords |
| CoF UX | Dual ring (major outer, relative minor inner); click sets global key; relatives highlight |
| Minor forms | Segmented control when minor is selected (default natural) |
| Degree filter | Roman-numeral strip I–vii°; optional focus on chord tones |
| Fret labels | Diatonic notes only; root emphasized; non-diatonic dark |
| Layout | Split: CoF left, fretboard bottom/right, Analyzer collapsible |
| Theme | Dark, high-contrast accents |
| Default state | C major, all diatonic, no degree filter |
| Persistence | localStorage for theory UI state only |
| Analyzer v1 | Provider interface + MockProvider with 2–3 fixture songs |
| Analyzer DTO | Title, primary key/mode, section timeline with chords/roman/borrowed flags |
| Hosting | GitHub Actions → Vite build → `gh-pages` branch |
| Scope phasing | Visual + audio + mock analyzer first; live HttpProvider next |

## Architecture (conceptual)

```
UI Shell (dark split layout)
├── Circle of Fifths (Pixi)  ──┐
├── Roman strip + minor form   ├──► Zustand theory store ◄── localStorage
├── Fretboard (Pixi)         ──┤         │
├── Tone.js audio            ◄─┘         │
└── Analyzer panel ── SongAnalyzerProvider (Mock | Http)
                              └── analysis timeline → store key jumps
```

## Deliverables

| ID | Deliverable | Size | Acceptance Criteria | Dependencies | Status |
|----|-------------|------|---------------------|--------------|--------|
| D1 | App scaffold + Pages-ready Vite React TS shell (dark layout chrome, empty panes) | S | App builds; static export works with configurable base path; split layout chrome renders desktop-first | — | Pending |
| D2 | Pure theory engine (keys, three minor forms, key-aware spellings, diatonic sets, degree → chord tones) | M | Pure functions cover C major and at least one sharp + one flat key; natural/harmonic/melodic differ on 6/7 as expected; no UI coupling | D1 | Pending |
| D3 | Zustand theory store + localStorage rehydrate | S | Store holds key, mode, minorForm, focusDegree; cold start C major; reload restores last theory UI state | D2 | Pending |
| D4 | Circle of Fifths dual-ring (Pixi): click selects key/mode; relative highlight | M | Click outer major / inner minor updates store; relative pair highlighted; smooth selection feedback | D3 | Pending |
| D5 | Fretboard (Pixi): EADGBE 0–12, diatonic labels, root emphasis, E/A/D power-chord emphasis | M | Changing store key updates frets instantly; non-diatonic dark; Low E/A/D visually stronger; 12 frets + open | D3 | Pending |
| D6 | Tone.js: note pitch + key tonic triad | S | Fret note click plays pitch; CoF key click plays triad for selected mode/minor form; respects user-gesture autoplay rules | D4, D5 | Pending |
| D7 | Roman-numeral strip + minor-form segmented control | S | Selecting a degree filters chord-tone focus on fretboard; re-select/All clears; minor form control visible only for minor keys and updates scale/triad | D4, D5 | Pending |
| D8 | SongAnalyzerProvider + MockProvider fixtures + collapsible panel | M | Search/select 2–3 fixture songs; DTO maps to section timeline; selecting a section updates store key; HttpProvider stub configurable by base URL without shipping secrets | D3 | Pending |
| D9 | GitHub Actions deploy to `gh-pages` | S | Push/main workflow builds and deploys; site loads on GitHub Pages URL | D1 | Pending |
| D10 | End-to-end sync polish + empty-state copy | S | Circle, fretboard, roman strip, audio, and mock analyzer stay consistent under rapid key changes; no orphan UI state | D6–D8 | Pending |

**Build-ready:** all deliverables are S/M (no L+ remaining).

## User Stories

1. As a guitarist, I select a key on the Circle and immediately see diatonic notes on the neck with correct spellings.
2. As a guitarist, I focus a roman-numeral degree and see only those chord tones, with power-chord strings emphasized on E/A/D.
3. As a guitarist, I hear a note when I click the neck and a tonic triad when I click a key.
4. As a guitarist in a minor key, I switch natural/harmonic/melodic and see the 6th/7th update.
5. As a learner, I open a fixture song analysis and jump the workspace to a section’s key.
6. As a future integrator, I point HttpProvider at a local LLM gateway without rewriting UI.

## Testing Decisions

| Deliverable | Seams under test |
|-------------|------------------|
| D2 | Unit tests on pure theory functions (pitch-class math, spellings, minor forms, degree chord tones) — primary TDD surface |
| D3 | Store unit tests: defaults, setters, localStorage rehydrate/serialize |
| D4–D5 | Lightweight interaction tests where practical; visual acceptance manual on desktop |
| D6 | Audio module unit tests with Tone mocked (no flaky real audio in CI) |
| D7 | Store + selector tests for focusDegree and minorForm effects on derived note sets |
| D8 | MockProvider returns fixture DTO; panel maps section click → store; HttpProvider builds request without embedding secrets |
| D9 | Workflow file present; documented Pages base-path requirement verified in build config |
| D10 | Manual checklist: rapid key switching, analyzer section jump, reload persistence |

## ⚠️ Irreversible Steps

- **None for implementation.** Deploying to `gh-pages` overwrites that branch’s published site (reversible by redeploying a prior commit). No data migrations, no secret rotation required for MockProvider path.
- **Human must never commit LLM API keys** into the static client; live analysis uses user/gateway URL only (see ADR 0002).

## Out of Scope (v1)

- Live cloud LLM wiring beyond HttpProvider stub/config
- Alternate tunings, >12 frets, left-handed neck
- Full phone-first UX parity
- Guitar sample packs / amp sims
- Melodic transcription or rhythm quantization
- User accounts, cloud save
- Non-guitar instruments

## Plan-Lenses Findings (advisory, folded into approval)

| Lens | Severity | Finding |
|------|----------|---------|
| security | high | Static GH Pages cannot safely hold provider API keys. HttpProvider must use only public gateway base URL (or user-entered), never a secret in client env baked into the bundle. |
| security | medium | Web Audio requires a user gesture; document/prime Tone context on first click to avoid silent failures. |
| ux | medium | Left column (CoF + roman strip + minor control) can densify; keep roman strip compact and hide minor control until minor is selected. |
| deployment | medium | Vite `base` must match GitHub Pages project URL (`/Music-Theory/`) or assets 404. |
| deployment | low | SPA deep links need `404.html` → `index.html` trick or hash router if section URLs are added later. |

## Execution Tracking

- **Issues:** https://github.com/DaveVoyles/Music-Theory/issues?q=is%3Aissue+state%3Aopen+label%3Aplan%3A0001
- **Board:** Standing “Agent Work” Projects v2 board (seed if project scope available; otherwise issues-only frontier)

## Approval

Approved as written via Lavish review 2026-07-25 (prompt: “Approve plan as written”).

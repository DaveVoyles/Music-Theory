# `src/theory/` — pure theory engine

UI-free TypeScript music theory. **Primary TDD surface** for plan 0001 D2.

## Contents

| File | Role |
|------|------|
| `types.ts` | `PitchClass`, `Mode`, `MinorForm`, `Degree`, `KeyRef`, spellings |
| `pitch.ts` | Pitch-class arithmetic, letter table, `parseSpelling` |
| `scales.ts` | Scale intervals (major + natural/harmonic/melodic minor), diatonic sets |
| `spellings.ts` | Key-aware diatonic spellings, relative major/minor, `spellPitchClass` |
| `degrees.ts` | Degree → chord tones, roman numerals, helpers |
| `keySignature.ts` | Sharps/flats count, order, teaching copy (`keySignatureInfo`) |
| `index.ts` | Public barrel — import from here |
| `theory.test.ts` | Unit tests (C major, sharp/flat keys, minor 6/7, triads) |
| `keySignature.test.ts` | Signature counts + pedagogical payloads |

## Usage

```ts
import { diatonicSpellings, chordTonePitchClasses, type KeyRef } from '../theory'

const key: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
diatonicSpellings(key) // ['C','D','E','F','G','A','B']
```

## Rules

- **No** `react`, DOM, Zustand, Tone, or Pixi imports.
- Pitch class: C = 0 … B = 11.
- Minor form only affects minor keys; major ignores it.

## Extending

- New modes/scales → `SCALE_INTERVALS` in `scales.ts` + tests.
- New chord qualities → build on `chordTonePitchClasses` / thirds-in-scale pattern in `degrees.ts`.

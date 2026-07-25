# `src/fretboard/` — neck map

Pure EADGBE neck model (open + frets 0–12). Rendering lives in `components/Fretboard.tsx`.

## Contents

| File | Role |
|------|------|
| `neck.ts` | `OPEN_STRING_PCS`, `buildNeck`, power-string set, `FretCell` |
| `neck.test.ts` | Diatonic labels, G major F#, power emphasis, focus degree |

## `buildNeck(key, focusDegree?)`

Returns cells with:

- `spelling` only when diatonic (else `null` → dark unmarked frets)
- `isRoot`, `isChordTone` (respects optional roman focus)
- `powerEmphasis` on Low E, A, D (string indices 0–2)

## Extending

- Alternate tunings → new open-string table (v1 deliberately standard only).
- More frets → `FRET_COUNT` + layout constants in the Pixi component.

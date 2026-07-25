# `src/cof/` — Circle of Fifths data

Pure data for the dual-ring Circle of Fifths. Rendering lives in `components/CircleOfFifths.tsx`.

## Contents

| File | Role |
|------|------|
| `circleData.ts` | 12 major/minor pairs, angles, `selectionFromWedge`, `pairIndexForKey` |
| `circleData.test.ts` | Relative pairs, selection, sharp/flat indices |

## Model

- **Outer ring:** major keys in fifths order (C at top, clockwise).
- **Inner ring:** relative minors on the same spoke.
- Click → `selectionFromWedge(index, 'major' | 'minor')` → `store.selectKey`.

## Extending

- Alternate enharmonic labels (e.g. Gb vs F#) → adjust `COF_MAJOR_SPELLINGS` / `COF_MINOR_SPELLINGS` and tests.
- Do not put Pixi draw code here.

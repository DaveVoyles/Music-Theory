# `src/store/` — theory UI state

Single Zustand store for key, mode, minor form, and degree focus. Persists **theory UI only** to `localStorage`.

## Contents

| File | Role |
|------|------|
| `theoryStore.ts` | State, actions, `createTheoryStore`, app singleton `useTheoryStore` |
| `index.ts` | Barrel |
| `theoryStore.test.ts` | Defaults, setters, rehydrate, focus clear on `selectKey` |
| `selectors.test.ts` | Store → neck derived tones (focus / minor form) |
| `sync.test.ts` | Rapid key jumps: CoF pair + neck roots stay consistent |

## State fields

| Field | Meaning |
|-------|---------|
| `key` | Tonic pitch class (C = 0) |
| `keySpelling` | Display spelling (`C`, `F#`, …) |
| `mode` | `major` \| `minor` |
| `minorForm` | `natural` \| `harmonic` \| `melodic` |
| `focusDegree` | `1`–`7` or `null` (all diatonic) |

Storage key: `music-theory:theory-ui`.

## Important actions

- `selectKey` — CoF / analyzer jumps; **clears `focusDegree`** when key/mode changes (no orphan filters).
- `toggleFocusDegree` — roman strip re-tap clears.
- `toKeyRef(state)` — bridge into pure `theory` / `fretboard` helpers.

## Extending

- New persisted fields → add to `TheoryUiState`, `partialize`, defaults, and tests.
- Prefer factory `createTheoryStore({ persist: false })` in unit tests.

# `src/components/` — React / Pixi views

Presentational + interactive UI. Prefer reading/writing `useTheoryStore` over deep props.

## Contents

| File | Role |
|------|------|
| `CircleOfFifths.tsx` | Pixi dual-ring CoF; click → `selectKey` + triad |
| `Fretboard.tsx` | Pixi neck; store-driven labels; click → pitch |
| `RomanStrip.tsx` | I–vii° + All → `focusDegree` |
| `MinorFormControl.tsx` | natural/harmonic/melodic (minor mode only) |
| `AnalyzerPanel.tsx` | Fixture search, timeline, section → `selectKey` |
| `HelpTip.tsx` | Accessible “?” popovers (What / How / Try this) from `help/featureHelp` |
| `KeyLesson.tsx` | Live key-signature lesson (count, accidentals, why, mnemonic) |
| `DegreeLesson.tsx` | Live degree-function lesson (role, triad, why, try this) |
| `QuizPanel.tsx` | Active-recall quiz; “Show on workspace” jumps store |

## Conventions

- **Pixi:** imperative `Application` in `useEffect`; destroy on unmount.
- **Pure data** stays in sibling packages (`cof/`, `fretboard/`); components paint and handle events.
- Keep files focused: new controls as new components; wire them in `App.tsx`.

## Extending

1. Add pure helpers + tests in the domain package.
2. Add or update a component here.
3. Mount in `App.tsx` shell if it’s a new region.

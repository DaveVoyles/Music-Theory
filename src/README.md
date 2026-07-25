# `src/` — application source

Entry points and feature packages for the Music Theory SPA.

## Files at this level

| File | Role |
|------|------|
| `main.tsx` | React root mount |
| `App.tsx` | Desktop-first shell: header, CoF column, fretboard, collapsible analyzer |
| `App.css` | Layout + panel chrome |
| `index.css` | Dark theme CSS variables, base reset |

## Packages

| Folder | Responsibility | README |
|--------|----------------|--------|
| [`theory/`](theory/) | Pure theory engine (no UI) | [theory/README.md](theory/README.md) |
| [`store/`](store/) | Zustand theory UI state + localStorage | [store/README.md](store/README.md) |
| [`cof/`](cof/) | Circle of Fifths pure geometry/selection data | [cof/README.md](cof/README.md) |
| [`fretboard/`](fretboard/) | Neck map pure data | [fretboard/README.md](fretboard/README.md) |
| [`audio/`](audio/) | Tone.js prime / pitch / triad | [audio/README.md](audio/README.md) |
| [`analyzer/`](analyzer/) | Song analysis providers + fixtures | [analyzer/README.md](analyzer/README.md) |
| [`components/`](components/) | React + Pixi views | [components/README.md](components/README.md) |
| [`help/`](help/) | Hover/focus feature explanations | [help/README.md](help/README.md) |

## Agent rules

- **Business rules** live in pure packages (`theory`, `cof`, `fretboard`, `analyzer` types). Components render and dispatch.
- Pixi components are **imperative Application** wrappers (not `@pixi/react`) — keep draw logic local; keep pitch/key math out of them.
- New UI features should read/write `useTheoryStore` rather than prop-drilling key state.

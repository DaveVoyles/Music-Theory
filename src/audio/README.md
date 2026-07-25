# `src/audio/` — aural feedback

Tone.js wrapper with **user-gesture priming**. Unit tests mock Tone; CI never needs real audio.

## Contents

| File | Role |
|------|------|
| `theoryAudio.ts` | `createTheoryAudio`, `theoryAudio` singleton, `pcToNoteName`, `triadNoteNames` |
| `index.ts` | Barrel |
| `theoryAudio.test.ts` | Note names, triad voicings, prime + trigger with mocks |

## API

| Method | Behavior |
|--------|----------|
| `prime()` | Starts AudioContext + builds synth (call from click handlers) |
| `playPitch(pc, octave?)` | Single note (default octave 4) |
| `playTriad(key)` | Tonic triad for mode/minor form via theory chord tones |

## Wiring today

- Fretboard note click → `playPitch`
- CoF key click → `playTriad` after `selectKey`

## Extending

- Inject `{ loadTone, synth }` for tests.
- Do not import Tone from React components — stay behind this module.
- Never autoplay without a gesture (browser policy).

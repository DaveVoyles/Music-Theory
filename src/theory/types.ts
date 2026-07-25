/** Pitch class 0–11 with C = 0 (twelve-tone equal temperament). */
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Mode = 'major' | 'minor'

/** Minor scale form; ignored when mode is major. Default for UI: natural. */
export type MinorForm = 'natural' | 'harmonic' | 'melodic'

/** Scale degree 1–7 (tonic = 1). */
export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** Key-aware note spelling, e.g. "F#", "Bb", "C". */
export type NoteSpelling = string

export interface KeyRef {
  /** Tonic pitch class. */
  tonic: PitchClass
  mode: Mode
  /**
   * Preferred tonic spelling for key-aware accidentals.
   * When omitted, a conventional spelling is chosen from the tonic class.
   */
  tonicSpelling?: NoteSpelling
  /** Only meaningful for minor; defaults to natural. */
  minorForm?: MinorForm
}

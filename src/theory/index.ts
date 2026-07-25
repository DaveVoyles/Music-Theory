/**
 * Pure music-theory engine (no React / DOM / store coupling).
 * Plan 0001 D2 — keys, minor forms, spellings, diatonic sets, degree chord tones.
 */
export type {
  Degree,
  KeyRef,
  MinorForm,
  Mode,
  NoteSpelling,
  PitchClass,
} from './types'

export {
  addSemitones,
  asPitchClass,
  LETTERS,
  NATURAL_PC,
  parseSpelling,
} from './pitch'

export {
  SCALE_INTERVALS,
  diatonicPitchClasses,
  diatonicPitchSet,
  isDiatonic,
  pitchClassForDegree,
  resolveMinorForm,
  scaleIntervals,
} from './scales'

export {
  assertKeyConsistency,
  defaultTonicSpelling,
  diatonicSpellings,
  relativeMajorTonic,
  relativeMinorTonic,
  spellPitchClass,
  spellingForDegree,
} from './spellings'

export {
  ALL_DEGREES,
  chordTonePitchClasses,
  chordToneSet,
  chordToneSpellings,
  degreeInterval,
  romanNumeral,
  transposeKey,
} from './degrees'

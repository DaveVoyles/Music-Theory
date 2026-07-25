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

export {
  ORDER_OF_FLATS,
  ORDER_OF_SHARPS,
  SHARP_LETTER_ORDER,
  FLAT_LETTER_ORDER,
  MAJOR_FIFTHS_FROM_C,
  accidentalsForFifths,
  fifthsForMajorSpelling,
  keySignatureInfo,
  type KeySignatureInfo,
  type SignatureKind,
} from './keySignature'

export {
  degreeLessonInfo,
  degreeLessonOverview,
  type DegreeLessonInfo,
  type HarmonicFunction,
} from './degreeLesson'

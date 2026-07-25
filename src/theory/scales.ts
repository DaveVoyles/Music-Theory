import { addSemitones } from './pitch'
import type { Degree, KeyRef, MinorForm, Mode, PitchClass } from './types'

/** Semitone offsets from tonic for each mode/form (degrees 1–7). */
export const SCALE_INTERVALS: Readonly<
  Record<Mode, Readonly<Record<MinorForm | 'major', readonly number[]>>>
> = {
  major: {
    major: [0, 2, 4, 5, 7, 9, 11],
    natural: [0, 2, 4, 5, 7, 9, 11],
    harmonic: [0, 2, 4, 5, 7, 9, 11],
    melodic: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    major: [0, 2, 3, 5, 7, 8, 10],
    natural: [0, 2, 3, 5, 7, 8, 10],
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    melodic: [0, 2, 3, 5, 7, 9, 11],
  },
}

export function resolveMinorForm(key: KeyRef): MinorForm {
  if (key.mode === 'major') return 'natural'
  return key.minorForm ?? 'natural'
}

export function scaleIntervals(key: KeyRef): readonly number[] {
  if (key.mode === 'major') {
    return SCALE_INTERVALS.major.major
  }
  const form = resolveMinorForm(key)
  return SCALE_INTERVALS.minor[form]
}

/** Seven diatonic pitch classes for the key, degree order 1..7. */
export function diatonicPitchClasses(key: KeyRef): PitchClass[] {
  const intervals = scaleIntervals(key)
  return intervals.map((semi) => addSemitones(key.tonic, semi))
}

export function diatonicPitchSet(key: KeyRef): ReadonlySet<PitchClass> {
  return new Set(diatonicPitchClasses(key))
}

export function pitchClassForDegree(key: KeyRef, degree: Degree): PitchClass {
  const pcs = diatonicPitchClasses(key)
  return pcs[degree - 1]!
}

/** True if pitch class is diatonic in the key (for given minor form). */
export function isDiatonic(key: KeyRef, pc: PitchClass): boolean {
  return diatonicPitchSet(key).has(pc)
}

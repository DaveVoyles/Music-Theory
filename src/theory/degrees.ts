import { addSemitones } from './pitch'
import { diatonicPitchClasses, scaleIntervals } from './scales'
import { diatonicSpellings } from './spellings'
import type { Degree, KeyRef, NoteSpelling, PitchClass } from './types'

/**
 * Chord tones for a scale degree: triad built in thirds within the scale
 * (degrees d, d+2, d+4, 1-indexed, wrapping 1–7).
 */
export function chordTonePitchClasses(
  key: KeyRef,
  degree: Degree,
): [PitchClass, PitchClass, PitchClass] {
  const scale = diatonicPitchClasses(key)
  const root = scale[degree - 1]!
  const third = scale[(degree - 1 + 2) % 7]!
  const fifth = scale[(degree - 1 + 4) % 7]!
  return [root, third, fifth]
}

export function chordToneSpellings(
  key: KeyRef,
  degree: Degree,
): [NoteSpelling, NoteSpelling, NoteSpelling] {
  const spells = diatonicSpellings(key)
  const root = spells[degree - 1]!
  const third = spells[(degree - 1 + 2) % 7]!
  const fifth = spells[(degree - 1 + 4) % 7]!
  return [root, third, fifth]
}

export function chordToneSet(key: KeyRef, degree: Degree): ReadonlySet<PitchClass> {
  return new Set(chordTonePitchClasses(key, degree))
}

/**
 * Simple roman numeral for major / natural-minor defaults.
 * Harmonic/melodic quality changes are left to callers if needed later.
 */
export function romanNumeral(key: KeyRef, degree: Degree): string {
  const majorRomans = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] as const
  const minorRomans = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] as const
  if (key.mode === 'major') return majorRomans[degree - 1]!

  // Harmonic minor: raised 7 → V major, vii°
  if ((key.minorForm ?? 'natural') === 'harmonic') {
    const harmonic = ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'] as const
    return harmonic[degree - 1]!
  }
  // Melodic minor: raised 6/7 → ii half-dim often written iio, IV, V
  if (key.minorForm === 'melodic') {
    const melodic = ['i', 'ii', 'III+', 'IV', 'V', 'vio', 'vii°'] as const
    return melodic[degree - 1]!
  }
  return minorRomans[degree - 1]!
}

/** All degree numbers 1–7. */
export const ALL_DEGREES: readonly Degree[] = [1, 2, 3, 4, 5, 6, 7]

/** Interval from tonic to degree in semitones. */
export function degreeInterval(key: KeyRef, degree: Degree): number {
  return scaleIntervals(key)[degree - 1]!
}

export function transposeKey(key: KeyRef, semitones: number): KeyRef {
  return {
    ...key,
    tonic: addSemitones(key.tonic, semitones),
    tonicSpelling: undefined,
  }
}

import type { Mode, NoteSpelling, PitchClass } from '../theory'
import { parseSpelling, relativeMajorTonic, relativeMinorTonic } from '../theory'

/** One position on the dual-ring Circle of Fifths (clockwise from C at top). */
export interface CofPosition {
  /** Index 0–11; 0 = C major / A minor. */
  index: number
  majorSpelling: NoteSpelling
  minorSpelling: NoteSpelling
  majorPc: PitchClass
  minorPc: PitchClass
  /** Angle of wedge center in radians; 0 = top, clockwise positive. */
  angle: number
}

/** Major keys in fifths order starting at C (index 0 at top). */
export const COF_MAJOR_SPELLINGS: readonly NoteSpelling[] = [
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
] as const

/** Relative minor spellings for each major position. */
export const COF_MINOR_SPELLINGS: readonly NoteSpelling[] = [
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'G#',
  'D#',
  'Bb',
  'F',
  'C',
  'G',
  'D',
] as const

const TWO_PI = Math.PI * 2
const STEP = TWO_PI / 12

export function buildCirclePositions(): CofPosition[] {
  return COF_MAJOR_SPELLINGS.map((majorSpelling, index) => {
    const minorSpelling = COF_MINOR_SPELLINGS[index]!
    return {
      index,
      majorSpelling,
      minorSpelling,
      majorPc: parseSpelling(majorSpelling),
      minorPc: parseSpelling(minorSpelling),
      // Center of wedge; index 0 at top (-π/2 in standard math coords if 0 is east,
      // but we use angle 0 = top for layout math below).
      angle: index * STEP,
    }
  })
}

export const COF_POSITIONS = buildCirclePositions()

/** Convert CoF angle (0 = top, clockwise) to canvas radians (0 = east, CCW). */
export function cofAngleToCanvas(angle: number): number {
  return angle - Math.PI / 2
}

export function wedgeStartAngle(index: number): number {
  return cofAngleToCanvas(index * STEP - STEP / 2)
}

export function wedgeEndAngle(index: number): number {
  return cofAngleToCanvas(index * STEP + STEP / 2)
}

export interface CofSelection {
  key: PitchClass
  keySpelling: NoteSpelling
  mode: Mode
  /** Index of the selected major/minor pair on the ring. */
  pairIndex: number
}

export function selectionFromWedge(
  index: number,
  ring: 'major' | 'minor',
): CofSelection {
  const pos = COF_POSITIONS[index]
  if (!pos) throw new Error(`Invalid CoF index: ${index}`)
  if (ring === 'major') {
    return {
      key: pos.majorPc,
      keySpelling: pos.majorSpelling,
      mode: 'major',
      pairIndex: index,
    }
  }
  return {
    key: pos.minorPc,
    keySpelling: pos.minorSpelling,
    mode: 'minor',
    pairIndex: index,
  }
}

/** Find ring index for a key/mode (best-effort match on pitch class). */
export function pairIndexForKey(key: PitchClass, mode: Mode): number {
  if (mode === 'major') {
    const i = COF_POSITIONS.findIndex((p) => p.majorPc === key)
    return i >= 0 ? i : 0
  }
  const i = COF_POSITIONS.findIndex((p) => p.minorPc === key)
  return i >= 0 ? i : 0
}

export function relativePairIndex(index: number): number {
  // Relative is the same index (outer major / inner minor share a spoke).
  return index
}

export function relativeOf(key: PitchClass, mode: Mode): PitchClass {
  return mode === 'major' ? relativeMinorTonic(key) : relativeMajorTonic(key)
}

import type { PitchClass } from './types'

export function asPitchClass(n: number): PitchClass {
  const mod = ((n % 12) + 12) % 12
  return mod as PitchClass
}

export function addSemitones(pc: PitchClass, semitones: number): PitchClass {
  return asPitchClass(pc + semitones)
}

/** Natural letter pitch classes (no accidentals): C D E F G A B */
export const NATURAL_PC: Readonly<Record<string, PitchClass>> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export type Letter = (typeof LETTERS)[number]

export function letterIndex(letter: string): number {
  const i = LETTERS.indexOf(letter.toUpperCase() as Letter)
  if (i < 0) throw new Error(`Invalid letter: ${letter}`)
  return i
}

/**
 * Parse a spelling like "C", "F#", "Bb", "Ebb", "Gx" into pitch class.
 * Supports #/b/x (double sharp) and bb (double flat).
 */
export function parseSpelling(spelling: string): PitchClass {
  const m = spelling.trim().match(/^([A-Ga-g])(.*)$/)
  if (!m) throw new Error(`Invalid spelling: ${spelling}`)
  const letter = m[1].toUpperCase()
  const acc = m[2]
  let pc = NATURAL_PC[letter]
  if (pc === undefined) throw new Error(`Invalid letter: ${letter}`)

  if (acc === '' || acc === '♮') return pc
  if (acc === '#') return addSemitones(pc, 1)
  if (acc === 'x' || acc === '##') return addSemitones(pc, 2)
  if (acc === 'b') return addSemitones(pc, -1)
  if (acc === 'bb') return addSemitones(pc, -2)
  throw new Error(`Unsupported accidental in spelling: ${spelling}`)
}

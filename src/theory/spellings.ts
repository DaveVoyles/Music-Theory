import {
  LETTERS,
  NATURAL_PC,
  addSemitones,
  asPitchClass,
  letterIndex,
  parseSpelling,
  type Letter,
} from './pitch'
import { scaleIntervals } from './scales'
import type { Degree, KeyRef, NoteSpelling, PitchClass } from './types'

/**
 * Conventional major-key tonic spellings by pitch class (prefer sharps on
 * the sharp side, flats on the flat side; C# over Db for 1, F# over Gb for 6).
 */
const DEFAULT_MAJOR_TONIC: Record<PitchClass, NoteSpelling> = {
  0: 'C',
  1: 'Db',
  2: 'D',
  3: 'Eb',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'Ab',
  9: 'A',
  10: 'Bb',
  11: 'B',
}

/** Relative major tonic PC for a minor tonic PC (minor + 3 semitones). */
export function relativeMajorTonic(minorTonic: PitchClass): PitchClass {
  return addSemitones(minorTonic, 3)
}

export function relativeMinorTonic(majorTonic: PitchClass): PitchClass {
  return addSemitones(majorTonic, -3)
}

export function defaultTonicSpelling(key: KeyRef): NoteSpelling {
  if (key.tonicSpelling) return key.tonicSpelling
  if (key.mode === 'major') return DEFAULT_MAJOR_TONIC[key.tonic]
  // Minor: spell as relative major's relative minor letter
  const relMaj = relativeMajorTonic(key.tonic)
  const majSpell = DEFAULT_MAJOR_TONIC[relMaj]
  // Relative minor is major tonic letter - 2 letters
  const majLetter = majSpell[0]!
  const mi = letterIndex(majLetter)
  const minorLetter = LETTERS[(mi + 5) % 7]! // -2 mod 7 = +5
  // Compute accidental so pitch matches key.tonic
  return spellLetterAtPc(minorLetter, key.tonic)
}

function accidentalOffset(letter: Letter, pc: PitchClass): number {
  const natural = NATURAL_PC[letter]!
  let delta = pc - natural
  if (delta > 6) delta -= 12
  if (delta < -6) delta += 12
  return delta
}

function formatAccidental(delta: number): string {
  if (delta === 0) return ''
  if (delta === 1) return '#'
  if (delta === 2) return 'x'
  if (delta === -1) return 'b'
  if (delta === -2) return 'bb'
  // Rare extremes — fall back to repeated marks
  if (delta > 0) return '#'.repeat(delta)
  return 'b'.repeat(-delta)
}

function spellLetterAtPc(letter: Letter, pc: PitchClass): NoteSpelling {
  return `${letter}${formatAccidental(accidentalOffset(letter, pc))}`
}

/**
 * Key-aware spellings for scale degrees 1–7.
 * Uses one letter per degree starting at the tonic letter (no letter skips).
 */
export function diatonicSpellings(key: KeyRef): NoteSpelling[] {
  const tonicSpell = defaultTonicSpelling(key)
  const tonicLetter = tonicSpell[0]!.toUpperCase() as Letter
  const start = letterIndex(tonicLetter)
  const intervals = scaleIntervals(key)
  const spellings: NoteSpelling[] = []

  for (let i = 0; i < 7; i++) {
    const letter = LETTERS[(start + i) % 7]!
    const pc = addSemitones(key.tonic, intervals[i]!)
    spellings.push(spellLetterAtPc(letter, pc))
  }
  return spellings
}

export function spellingForDegree(key: KeyRef, degree: Degree): NoteSpelling {
  return diatonicSpellings(key)[degree - 1]!
}

/**
 * Spell an arbitrary pitch class in the context of a key.
 * Prefers the diatonic spelling when the PC is in the scale; otherwise
 * chooses a spelling consistent with the key's sharp/flat preference.
 */
export function spellPitchClass(key: KeyRef, pc: PitchClass): NoteSpelling {
  const spellings = diatonicSpellings(key)
  const intervals = scaleIntervals(key)
  for (let i = 0; i < 7; i++) {
    const degreePc = addSemitones(key.tonic, intervals[i]!)
    if (degreePc === pc) return spellings[i]!
  }

  // Non-diatonic: prefer sharp or flat side from tonic spelling
  const tonicSpell = defaultTonicSpelling(key)
  const prefersFlats = tonicSpell.includes('b') || tonicSpell === 'F'
  // F major and flat keys prefer flats; sharp keys and C/G prefer sharps
  // also: if tonic is F (natural) prefer flats for non-diatonic
  const sharpNames: NoteSpelling[] = [
    'C',
    'C#',
    'D',
    'D#',
    'E',
    'F',
    'F#',
    'G',
    'G#',
    'A',
    'A#',
    'B',
  ]
  const flatNames: NoteSpelling[] = [
    'C',
    'Db',
    'D',
    'Eb',
    'E',
    'F',
    'Gb',
    'G',
    'Ab',
    'A',
    'Bb',
    'B',
  ]
  return (prefersFlats ? flatNames : sharpNames)[pc]!
}

/** Ensure tonicSpelling (if provided) matches tonic pitch class. */
export function assertKeyConsistency(key: KeyRef): void {
  if (!key.tonicSpelling) return
  const parsed = parseSpelling(key.tonicSpelling)
  if (parsed !== asPitchClass(key.tonic)) {
    throw new Error(
      `tonicSpelling ${key.tonicSpelling} is pc ${parsed}, key.tonic is ${key.tonic}`,
    )
  }
}

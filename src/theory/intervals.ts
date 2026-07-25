/**
 * Interval pedagogy — pure engine (semitone distance → name, short lesson copy).
 */

import { asPitchClass } from './pitch'
import type { NoteSpelling, PitchClass } from './types'

/** Ordered ascending interval names by semitone distance 0–12. */
export const INTERVAL_BY_SEMITONES = [
  { short: 'P1', name: 'Perfect unison', quality: 'perfect' },
  { short: 'm2', name: 'Minor second', quality: 'minor' },
  { short: 'M2', name: 'Major second', quality: 'major' },
  { short: 'm3', name: 'Minor third', quality: 'minor' },
  { short: 'M3', name: 'Major third', quality: 'major' },
  { short: 'P4', name: 'Perfect fourth', quality: 'perfect' },
  { short: 'A4/d5', name: 'Tritone', quality: 'augmented/diminished' },
  { short: 'P5', name: 'Perfect fifth', quality: 'perfect' },
  { short: 'm6', name: 'Minor sixth', quality: 'minor' },
  { short: 'M6', name: 'Major sixth', quality: 'major' },
  { short: 'm7', name: 'Minor seventh', quality: 'minor' },
  { short: 'M7', name: 'Major seventh', quality: 'major' },
  { short: 'P8', name: 'Perfect octave', quality: 'perfect' },
] as const

export type IntervalQuality = (typeof INTERVAL_BY_SEMITONES)[number]['quality']

export interface PitchPick {
  pc: PitchClass
  spelling: NoteSpelling
}

export interface IntervalInfo {
  /** Ascending semitone distance 0–11 within an octave (12 = same class, treated as P1/P8 context). */
  semitones: number
  short: string
  name: string
  quality: IntervalQuality
  lower: PitchPick
  upper: PitchPick
  /** One-line fact for the lesson panel. */
  summary: string
  why: string
  tryThis: string
}

/** Shortest ascending distance from `from` up to `to` (0–11). */
export function ascendingSemitones(from: PitchClass, to: PitchClass): number {
  return ((to - from) % 12 + 12) % 12
}

/**
 * Interval from pitch A up to pitch B (within an octave).
 * If equal, reports perfect unison (P1).
 */
export function intervalInfo(a: PitchPick, b: PitchPick): IntervalInfo {
  const semi = ascendingSemitones(a.pc, b.pc)
  // Prefer spelling order: lower is the starting pick for unison; for others
  // order as ascending from a → b musically (a is "from", b is "to").
  const meta = INTERVAL_BY_SEMITONES[semi]!
  const lower = a
  const upper = b
  const label = `${a.spelling} → ${b.spelling}`

  return {
    semitones: semi,
    short: meta.short,
    name: meta.name,
    quality: meta.quality,
    lower,
    upper,
    summary: `${label} is a ${meta.name} (${meta.short}) — ${semi} semitone${semi === 1 ? '' : 's'} up.`,
    why: whyFor(semi, meta.name, meta.short),
    tryThis: tryThisFor(semi),
  }
}

function whyFor(semi: number, name: string, short: string): string {
  switch (semi) {
    case 0:
      return 'Same pitch class — unison. On the neck, the same note appears in many places an octave apart; within one octave this is “the same note.”'
    case 1:
      return 'The minor second is the smallest step in 12-tone equal temperament — the “leading tone → tonic” half-step uses this pull.'
    case 2:
      return 'The major second is a whole step — how major/natural minor scales move between most adjacent degrees.'
    case 3:
      return 'Minor third = three semitones. Stack two for a minor triad (root–m3–P5). Darker than a major third.'
    case 4:
      return 'Major third = four semitones. With a perfect fifth it builds a major triad (bright “do–mi–sol” color).'
    case 5:
      return 'Perfect fourth is very stable (think “here comes the bride”). Inversions of fifths; common in power-chord shapes with the fifth below.'
    case 6:
      return 'The tritone splits the octave in half — unstable, wants to resolve. Classic dominant tension (in C, F–B is a tritone).'
    case 7:
      return 'Perfect fifth = seven semitones. The strongest open consonant after the octave; power chords are root + fifth. The Circle of Fifths is built on this interval.'
    case 8:
      return 'Minor sixth inverts a major third (M3 + m6 = octave). Common expressive leap in melodies.'
    case 9:
      return 'Major sixth inverts a minor third. Open, singing quality — often used in folk and pop hooks.'
    case 10:
      return 'Minor seventh is the top of a dominant-seventh chord (root–M3–P5–m7). Bluesy, wants to resolve down by step.'
    case 11:
      return 'Major seventh is a half-step below the octave — jazzy “maj7” color. Very close to the root above, so it pulls upward.'
    default:
      return `${name} (${short}) spans ${semi} semitones.`
  }
}

function tryThisFor(semi: number): string {
  switch (semi) {
    case 0:
      return 'Click the same note name on two strings — same class, different frets (octaves aside).'
    case 1:
      return 'In any major key, find the leading tone (degree 7) then the tonic — that half-step is a minor second.'
    case 2:
      return 'Walk a major scale on one string: most steps are major seconds (whole steps).'
    case 3:
    case 4:
      return 'Build a triad: root, then this third, then a perfect fifth above the root.'
    case 5:
      return 'On guitar, fret a note and the note five frets higher on the same string — that’s a perfect fourth.'
    case 6:
      return 'In C major click F then B (or B then F ascending the other way) — hear the tritone restlessness.'
    case 7:
      return 'Click C on the Circle, then G — keys a fifth apart. Or root + 7 frets on one string.'
    case 8:
    case 9:
      return 'Sing or play the interval, then reverse the two frets — you hear the inversion quality change.'
    case 10:
    case 11:
      return 'Compare m7 vs M7 above the same root — one bluesy/dominant, one maj7 color.'
    default:
      return 'Click two frets (or two keys on the Circle) and compare the sound to the name above.'
  }
}

/** Coerce a number to PitchClass for store wiring. */
export function asPick(pc: number, spelling: NoteSpelling): PitchPick {
  return { pc: asPitchClass(pc), spelling }
}

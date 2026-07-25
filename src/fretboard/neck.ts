import {
  chordToneSet,
  diatonicPitchClasses,
  diatonicPitchSet,
  spellPitchClass,
  type Degree,
  type KeyRef,
  type NoteSpelling,
  type PitchClass,
} from '../theory'
import { addSemitones, asPitchClass } from '../theory'

/** Standard tuning low→high: E A D G B e (open pitch classes). */
export const OPEN_STRING_PCS: readonly PitchClass[] = [4, 9, 2, 7, 11, 4]

/**
 * Open-string MIDI numbers (concert pitch), low E → high e.
 * E2=40, A2=45, D3=50, G3=55, B3=59, E4=64.
 */
export const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64] as const

/** Display names for open strings (low → high). */
export const OPEN_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'] as const

/** Frets rendered: open (0) through 12. */
export const FRET_COUNT = 12

/** String indices with power-chord visual emphasis (Low E, A, D). */
export const POWER_STRINGS: ReadonlySet<number> = new Set([0, 1, 2])

/** Absolute MIDI note for string + fret (standard tuning). */
export function midiAt(stringIndex: number, fret: number): number {
  const open = OPEN_STRING_MIDI[stringIndex]
  if (open === undefined) throw new Error(`Bad string index ${stringIndex}`)
  return open + fret
}

/** Scientific octave for string + fret (e.g. open low E → 2). */
export function octaveAt(stringIndex: number, fret: number): number {
  return Math.floor(midiAt(stringIndex, fret) / 12) - 1
}

export interface FretCell {
  stringIndex: number
  fret: number
  pc: PitchClass
  spelling: NoteSpelling | null
  /** Scale degree 1–7 when diatonic; null outside the key. */
  scaleDegree: Degree | null
  isDiatonic: boolean
  isRoot: boolean
  isChordTone: boolean
  powerEmphasis: boolean
}

export function pitchAt(stringIndex: number, fret: number): PitchClass {
  const open = OPEN_STRING_PCS[stringIndex]
  if (open === undefined) throw new Error(`Bad string index ${stringIndex}`)
  return addSemitones(open, fret)
}

function degreeMap(key: KeyRef): Map<PitchClass, Degree> {
  const map = new Map<PitchClass, Degree>()
  const pcs = diatonicPitchClasses(key)
  for (let i = 0; i < pcs.length; i++) {
    map.set(pcs[i]!, (i + 1) as Degree)
  }
  return map
}

/**
 * Build the 6×13 neck map for a key (and optional focus degree).
 * Non-diatonic cells have null spelling (dark / unlabeled).
 */
export function buildNeck(
  key: KeyRef,
  focusDegree: Degree | null = null,
): FretCell[] {
  const diatonic = diatonicPitchSet(key)
  const degrees = degreeMap(key)
  const root = asPitchClass(key.tonic)
  const chordTones =
    focusDegree === null ? null : chordToneSet(key, focusDegree)

  const cells: FretCell[] = []
  for (let s = 0; s < OPEN_STRING_PCS.length; s++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const pc = pitchAt(s, fret)
      const isDiatonic = diatonic.has(pc)
      const isChordTone = chordTones ? chordTones.has(pc) : isDiatonic
      cells.push({
        stringIndex: s,
        fret,
        pc,
        spelling: isDiatonic ? spellPitchClass(key, pc) : null,
        scaleDegree: isDiatonic ? (degrees.get(pc) ?? null) : null,
        isDiatonic,
        isRoot: pc === root,
        isChordTone,
        powerEmphasis: POWER_STRINGS.has(s),
      })
    }
  }
  return cells
}

import {
  chordToneSet,
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

/** Display names for open strings (low → high). */
export const OPEN_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'] as const

/** Frets rendered: open (0) through 12. */
export const FRET_COUNT = 12

/** String indices with power-chord visual emphasis (Low E, A, D). */
export const POWER_STRINGS: ReadonlySet<number> = new Set([0, 1, 2])

export interface FretCell {
  stringIndex: number
  fret: number
  pc: PitchClass
  spelling: NoteSpelling | null
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

/**
 * Build the 6×13 neck map for a key (and optional focus degree).
 * Non-diatonic cells have null spelling (dark / unlabeled).
 */
export function buildNeck(
  key: KeyRef,
  focusDegree: Degree | null = null,
): FretCell[] {
  const diatonic = diatonicPitchSet(key)
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
        isDiatonic,
        isRoot: pc === root,
        isChordTone,
        powerEmphasis: POWER_STRINGS.has(s),
      })
    }
  }
  return cells
}

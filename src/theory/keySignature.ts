/**
 * Key signatures as a teaching surface: how many sharps/flats, which ones,
 * and short “why / how to remember” copy for the selected key.
 *
 * Pure functions — no React, no CoF/UI imports. Minor keys share the relative
 * major’s signature (same notes, different tonic).
 */

import {
  defaultTonicSpelling,
  diatonicSpellings,
  relativeMajorTonic,
  relativeMinorTonic,
} from './spellings'
import type { KeyRef, Mode, NoteSpelling, PitchClass } from './types'

/** Traditional order accidentals are added (left → right on the staff). */
export const ORDER_OF_SHARPS: readonly NoteSpelling[] = [
  'F#',
  'C#',
  'G#',
  'D#',
  'A#',
  'E#',
  'B#',
] as const

export const ORDER_OF_FLATS: readonly NoteSpelling[] = [
  'Bb',
  'Eb',
  'Ab',
  'Db',
  'Gb',
  'Cb',
  'Fb',
] as const

/** Letters only — useful for the “Father Charles…” mnemonic. */
export const SHARP_LETTER_ORDER = 'F C G D A E B' as const
export const FLAT_LETTER_ORDER = 'B E A D G C F' as const

/**
 * Conventional major keys → fifths from C.
 * Positive = sharp side (clockwise on the CoF); negative = flat side.
 */
export const MAJOR_FIFTHS_FROM_C: Readonly<Record<string, number>> = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  'F#': 6,
  'C#': 7,
  F: -1,
  Bb: -2,
  Eb: -3,
  Ab: -4,
  Db: -5,
  Gb: -6,
  Cb: -7,
}

export type SignatureKind = 'natural' | 'sharp' | 'flat'

export interface KeySignatureInfo {
  /** Key this lesson is about (mode-aware spelling). */
  keyLabel: string
  mode: Mode
  kind: SignatureKind
  /** 0–7 accidentals in the signature. */
  count: number
  /** Accidentals in staff order, e.g. ["F#", "C#"] or ["Bb", "Eb"]. */
  accidentals: readonly NoteSpelling[]
  /**
   * Steps from C major: positive = sharp side, negative = flat side.
   * 0 = C / A minor.
   */
  fifthsFromC: number
  /** Major key that owns this signature. */
  relativeMajor: NoteSpelling
  /** Natural minor that shares this signature. */
  relativeMinor: NoteSpelling
  /** Diatonic scale spellings for the selected key (natural minor form). */
  scaleNotes: readonly NoteSpelling[]
  /** One-line fact: “G major has 1 sharp: F#”. */
  summary: string
  /** Why this signature exists (circle + scale pattern). */
  why: string
  /** Memory aid (order of sharps/flats, relative pair). */
  howToRemember: string
}

/** Accidentals for a major key at a given fifths-from-C value. */
export function accidentalsForFifths(fifths: number): {
  kind: SignatureKind
  count: number
  accidentals: readonly NoteSpelling[]
} {
  if (fifths === 0) {
    return { kind: 'natural', count: 0, accidentals: [] }
  }
  if (fifths > 0) {
    const count = Math.min(fifths, ORDER_OF_SHARPS.length)
    return {
      kind: 'sharp',
      count,
      accidentals: ORDER_OF_SHARPS.slice(0, count),
    }
  }
  const count = Math.min(-fifths, ORDER_OF_FLATS.length)
  return {
    kind: 'flat',
    count,
    accidentals: ORDER_OF_FLATS.slice(0, count),
  }
}

/**
 * Resolve fifths-from-C for a major tonic spelling.
 * Falls back to 0 if the spelling is not a conventional key name.
 */
export function fifthsForMajorSpelling(spelling: NoteSpelling): number {
  const n = MAJOR_FIFTHS_FROM_C[spelling]
  if (n !== undefined) return n
  // Enharmonic / unexpected: treat as C (safe empty signature) rather than throw
  return 0
}

function formatAccidentalList(accidentals: readonly NoteSpelling[]): string {
  if (accidentals.length === 0) return 'none'
  if (accidentals.length === 1) return accidentals[0]!
  if (accidentals.length === 2) return `${accidentals[0]} and ${accidentals[1]}`
  const head = accidentals.slice(0, -1).join(', ')
  return `${head}, and ${accidentals[accidentals.length - 1]}`
}

function countPhrase(kind: SignatureKind, count: number): string {
  if (kind === 'natural' || count === 0) return 'no sharps or flats'
  const unit =
    kind === 'sharp'
      ? count === 1
        ? 'sharp'
        : 'sharps'
      : count === 1
        ? 'flat'
        : 'flats'
  return `${count} ${unit}`
}

function buildSummary(
  keyLabel: string,
  kind: SignatureKind,
  count: number,
  accidentals: readonly NoteSpelling[],
): string {
  if (kind === 'natural' || count === 0) {
    return `${keyLabel} has no sharps or flats.`
  }
  return `${keyLabel} has ${countPhrase(kind, count)}: ${formatAccidentalList(accidentals)}.`
}

function buildWhy(
  mode: Mode,
  kind: SignatureKind,
  count: number,
  fifths: number,
  relativeMajor: NoteSpelling,
  relativeMinor: NoteSpelling,
): string {
  if (kind === 'natural' || count === 0) {
    if (mode === 'minor') {
      return `${relativeMinor} minor is the relative minor of ${relativeMajor} major — same notes, different tonic. Both sit at the “home” position on the Circle of Fifths (zero accidentals).`
    }
    return `C major is the home key on the Circle of Fifths. Its scale uses only natural notes (C D E F G A B), so the signature is empty. Half-steps already fall between 3–4 (E–F) and 7–1 (B–C).`
  }

  const side =
    fifths > 0
      ? `${fifths} step${fifths === 1 ? '' : 's'} clockwise (sharp side) from C`
      : `${-fifths} step${fifths === -1 ? '' : 's'} counter-clockwise (flat side) from C`

  if (mode === 'minor') {
    return `${relativeMinor} minor shares ${relativeMajor} major’s key signature (relative pair — same notes, different starting pitch). ${relativeMajor} major sits ${side} on the Circle of Fifths.`
  }

  if (fifths > 0) {
    return `This major key sits ${side}. Each clockwise step is a perfect fifth up and adds one sharp — the new leading tone (raised 7th) so the major pattern W–W–H–W–W–W–H still lands on consecutive letter names.`
  }

  return `This major key sits ${side}. Each counter-clockwise step is a perfect fifth down and adds one flat — usually the lowered 4th of the new key — so the major scale pattern still fits consecutive letters.`
}

function buildHowToRemember(
  kind: SignatureKind,
  count: number,
  mode: Mode,
  relativeMajor: NoteSpelling,
  relativeMinor: NoteSpelling,
): string {
  const relativeTip =
    mode === 'minor'
      ? ` Relative minor of ${relativeMajor} major (same signature).`
      : ` Relative minor is ${relativeMinor} minor (same signature, different tonic).`

  if (kind === 'natural' || count === 0) {
    return `Empty signature = C major / A minor.${relativeTip}`
  }

  if (kind === 'sharp') {
    return `Order of sharps: ${SHARP_LETTER_ORDER} (“Father Charles Goes Down And Ends Battle”). First ${count} of that list.${relativeTip}`
  }

  return `Order of flats: ${FLAT_LETTER_ORDER} (reverse of sharps — “Battle Ends And Down Goes Charles’ Father”). First ${count} of that list.${relativeTip}`
}

/**
 * Full teaching payload for a key. Minor forms (harmonic/melodic) do not
 * change the written key signature — only natural-minor notes share it —
 * so lessons always describe the signature of the relative major pair.
 */
export function keySignatureInfo(key: KeyRef): KeySignatureInfo {
  const majorTonic: PitchClass =
    key.mode === 'major' ? key.tonic : relativeMajorTonic(key.tonic)
  const majorSpelling: NoteSpelling =
    key.mode === 'major'
      ? defaultTonicSpelling({ ...key, mode: 'major' })
      : defaultTonicSpelling({ tonic: majorTonic, mode: 'major' })

  const fifths = fifthsForMajorSpelling(majorSpelling)
  const { kind, count, accidentals } = accidentalsForFifths(fifths)

  const relativeMinorPc = relativeMinorTonic(majorTonic)
  const relativeMinor = defaultTonicSpelling({
    tonic: relativeMinorPc,
    mode: 'minor',
  })

  const scaleKey: KeyRef =
    key.mode === 'major'
      ? { tonic: key.tonic, mode: 'major', tonicSpelling: key.tonicSpelling }
      : {
          tonic: key.tonic,
          mode: 'minor',
          tonicSpelling: key.tonicSpelling,
          minorForm: 'natural',
        }
  const scaleNotes = diatonicSpellings(scaleKey)

  const keyLabel =
    key.mode === 'minor'
      ? `${defaultTonicSpelling(key)} minor`
      : `${defaultTonicSpelling(key)} major`

  return {
    keyLabel,
    mode: key.mode,
    kind,
    count,
    accidentals,
    fifthsFromC: fifths,
    relativeMajor: majorSpelling,
    relativeMinor,
    scaleNotes,
    summary: buildSummary(keyLabel, kind, count, accidentals),
    why: buildWhy(key.mode, kind, count, fifths, majorSpelling, relativeMinor),
    howToRemember: buildHowToRemember(
      kind,
      count,
      key.mode,
      majorSpelling,
      relativeMinor,
    ),
  }
}

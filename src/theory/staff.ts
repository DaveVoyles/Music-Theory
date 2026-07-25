/**
 * Treble-staff key-signature layout — pure positions for SVG rendering.
 * Positions follow conventional engraved order of sharps / flats.
 */

import type { SignatureKind } from './keySignature'

/** Staff space unit: line spacing = 1 (y increases downward). */
export interface StaffAccidentalPos {
  /** Accidental spelling, e.g. F# or Bb. */
  spelling: string
  /** Glyph: ♯ or ♭ */
  glyph: '♯' | '♭'
  /**
   * Vertical position in staff spaces from the top line of the treble staff.
   * 0 = top line (F5), 0.5 = space below, … 4 = bottom line (E4).
   * Values may be <0 (above staff) or >4 (below).
   */
  staffY: number
  /** Index in signature order (0 = leftmost). */
  order: number
}

/**
 * Standard treble-clef sharp positions (order of sharps F C G D A E B).
 * Tuned for a simple five-line staff with top line = F5.
 */
const SHARP_STAFF_Y = [1, 2.5, 0.5, 2, 3.5, 1.5, 3] as const

/** Standard treble-clef flat positions (order of flats B E A D G C F). */
const FLAT_STAFF_Y = [2, 0.5, 2.5, 1, 3, 1.5, 3.5] as const

export interface StaffSignatureLayout {
  kind: SignatureKind
  count: number
  positions: readonly StaffAccidentalPos[]
}

/**
 * Layout accidentals for a key signature on treble staff.
 * `accidentals` must already be in staff order (from keySignatureInfo).
 */
export function staffSignatureLayout(
  kind: SignatureKind,
  accidentals: readonly string[],
): StaffSignatureLayout {
  if (kind === 'natural' || accidentals.length === 0) {
    return { kind: 'natural', count: 0, positions: [] }
  }
  const ys = kind === 'sharp' ? SHARP_STAFF_Y : FLAT_STAFF_Y
  const glyph = kind === 'sharp' ? ('♯' as const) : ('♭' as const)
  const positions: StaffAccidentalPos[] = accidentals.map((spelling, i) => ({
    spelling,
    glyph,
    staffY: ys[i] ?? 2,
    order: i,
  }))
  return { kind, count: positions.length, positions }
}

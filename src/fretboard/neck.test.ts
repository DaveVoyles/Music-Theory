import { describe, expect, it } from 'vitest'
import { buildNeck, OPEN_STRING_PCS, pitchAt } from './neck'
import type { KeyRef } from '../theory'

const C_MAJOR: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
const G_MAJOR: KeyRef = { tonic: 7, mode: 'major', tonicSpelling: 'G' }

describe('pitchAt', () => {
  it('returns open E/A/D/G/B/e pitch classes', () => {
    expect(OPEN_STRING_PCS).toEqual([4, 9, 2, 7, 11, 4])
    expect(pitchAt(0, 0)).toBe(4)
    expect(pitchAt(0, 1)).toBe(5) // F
    expect(pitchAt(1, 0)).toBe(9) // A
  })
})

describe('buildNeck', () => {
  it('labels only diatonic notes in C major; root emphasized', () => {
    const cells = buildNeck(C_MAJOR)
    // Low E open is E (pc 4) — diatonic in C
    const eOpen = cells.find((c) => c.stringIndex === 0 && c.fret === 0)!
    expect(eOpen.isDiatonic).toBe(true)
    expect(eOpen.spelling).toBe('E')
    expect(eOpen.isRoot).toBe(false)

    // C on A string fret 3
    const c = cells.find((c) => c.stringIndex === 1 && c.fret === 3)!
    expect(c.pc).toBe(0)
    expect(c.isRoot).toBe(true)
    expect(c.spelling).toBe('C')

    // F# is not diatonic in C
    const fs = cells.find((c) => c.stringIndex === 0 && c.fret === 2)! // F#
    expect(fs.pc).toBe(6)
    expect(fs.isDiatonic).toBe(false)
    expect(fs.spelling).toBeNull()
  })

  it('updates for G major (F# diatonic, F natural dark)', () => {
    const cells = buildNeck(G_MAJOR)
    const fs = cells.find((c) => c.stringIndex === 0 && c.fret === 2)!
    expect(fs.isDiatonic).toBe(true)
    expect(fs.spelling).toBe('F#')
    const fNat = cells.find((c) => c.stringIndex === 0 && c.fret === 1)!
    expect(fNat.isDiatonic).toBe(false)
  })

  it('marks Low E/A/D with power-chord emphasis', () => {
    const cells = buildNeck(C_MAJOR)
    for (const s of [0, 1, 2]) {
      expect(cells.find((c) => c.stringIndex === s && c.fret === 0)!.powerEmphasis).toBe(
        true,
      )
    }
    expect(cells.find((c) => c.stringIndex === 3 && c.fret === 0)!.powerEmphasis).toBe(
      false,
    )
  })

  it('focusDegree restricts chord-tone flag to triad tones', () => {
    const all = buildNeck(C_MAJOR, null)
    const iOnly = buildNeck(C_MAJOR, 1)
    // In C major I = C E G — B is diatonic but not a I chord tone
    const b = all.find((c) => c.stringIndex === 0 && c.fret === 7)! // B
    expect(b.isDiatonic).toBe(true)
    const bFocused = iOnly.find((c) => c.stringIndex === 0 && c.fret === 7)!
    expect(bFocused.isChordTone).toBe(false)
    const c = iOnly.find((c) => c.stringIndex === 1 && c.fret === 3)!
    expect(c.isChordTone).toBe(true)
  })
})

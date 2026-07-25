import { describe, expect, it } from 'vitest'
import {
  accidentalsForFifths,
  fifthsForMajorSpelling,
  keySignatureInfo,
  ORDER_OF_FLATS,
  ORDER_OF_SHARPS,
} from './keySignature'
import type { KeyRef } from './types'

const C_MAJOR: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
const G_MAJOR: KeyRef = { tonic: 7, mode: 'major', tonicSpelling: 'G' }
const D_MAJOR: KeyRef = { tonic: 2, mode: 'major', tonicSpelling: 'D' }
const F_MAJOR: KeyRef = { tonic: 5, mode: 'major', tonicSpelling: 'F' }
const BB_MAJOR: KeyRef = { tonic: 10, mode: 'major', tonicSpelling: 'Bb' }
const A_MINOR: KeyRef = { tonic: 9, mode: 'minor', tonicSpelling: 'A' }
const E_MINOR: KeyRef = { tonic: 4, mode: 'minor', tonicSpelling: 'E' }
const D_MINOR: KeyRef = { tonic: 2, mode: 'minor', tonicSpelling: 'D' }

describe('fifthsForMajorSpelling', () => {
  it('maps home and sharp/flat sides', () => {
    expect(fifthsForMajorSpelling('C')).toBe(0)
    expect(fifthsForMajorSpelling('G')).toBe(1)
    expect(fifthsForMajorSpelling('F#')).toBe(6)
    expect(fifthsForMajorSpelling('F')).toBe(-1)
    expect(fifthsForMajorSpelling('Bb')).toBe(-2)
    expect(fifthsForMajorSpelling('Db')).toBe(-5)
  })
})

describe('accidentalsForFifths', () => {
  it('returns empty for C', () => {
    expect(accidentalsForFifths(0)).toEqual({
      kind: 'natural',
      count: 0,
      accidentals: [],
    })
  })

  it('takes the first N sharps in order', () => {
    expect(accidentalsForFifths(1).accidentals).toEqual(['F#'])
    expect(accidentalsForFifths(2).accidentals).toEqual(['F#', 'C#'])
    expect(accidentalsForFifths(3).accidentals).toEqual(ORDER_OF_SHARPS.slice(0, 3))
  })

  it('takes the first N flats in order', () => {
    expect(accidentalsForFifths(-1).accidentals).toEqual(['Bb'])
    expect(accidentalsForFifths(-2).accidentals).toEqual(['Bb', 'Eb'])
    expect(accidentalsForFifths(-3).accidentals).toEqual(ORDER_OF_FLATS.slice(0, 3))
  })
})

describe('keySignatureInfo', () => {
  it('teaches C major as the empty signature', () => {
    const info = keySignatureInfo(C_MAJOR)
    expect(info.count).toBe(0)
    expect(info.kind).toBe('natural')
    expect(info.accidentals).toEqual([])
    expect(info.summary).toMatch(/no sharps or flats/i)
    expect(info.scaleNotes).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(info.relativeMinor).toBe('A')
    expect(info.why.length).toBeGreaterThan(40)
    expect(info.howToRemember).toMatch(/Father Charles|Empty signature/i)
  })

  it('teaches G major: 1 sharp F#', () => {
    const info = keySignatureInfo(G_MAJOR)
    expect(info.count).toBe(1)
    expect(info.kind).toBe('sharp')
    expect(info.accidentals).toEqual(['F#'])
    expect(info.fifthsFromC).toBe(1)
    expect(info.summary).toMatch(/1 sharp/)
    expect(info.summary).toMatch(/F#/)
    expect(info.scaleNotes).toContain('F#')
    expect(info.why).toMatch(/clockwise|fifth/i)
    expect(info.howToRemember).toMatch(/F C G D A E B/)
  })

  it('teaches D major: 2 sharps F# C#', () => {
    const info = keySignatureInfo(D_MAJOR)
    expect(info.accidentals).toEqual(['F#', 'C#'])
    expect(info.count).toBe(2)
    expect(info.fifthsFromC).toBe(2)
  })

  it('teaches F major: 1 flat Bb', () => {
    const info = keySignatureInfo(F_MAJOR)
    expect(info.kind).toBe('flat')
    expect(info.count).toBe(1)
    expect(info.accidentals).toEqual(['Bb'])
    expect(info.fifthsFromC).toBe(-1)
    expect(info.summary).toMatch(/1 flat/)
    expect(info.why).toMatch(/counter-clockwise|flat side/i)
    expect(info.howToRemember).toMatch(/B E A D G C F/)
  })

  it('teaches Bb major: 2 flats', () => {
    const info = keySignatureInfo(BB_MAJOR)
    expect(info.accidentals).toEqual(['Bb', 'Eb'])
    expect(info.count).toBe(2)
  })

  it('relative minor shares major signature (A minor = C major)', () => {
    const info = keySignatureInfo(A_MINOR)
    expect(info.count).toBe(0)
    expect(info.kind).toBe('natural')
    expect(info.relativeMajor).toBe('C')
    expect(info.summary).toMatch(/A minor/)
    expect(info.why).toMatch(/relative/i)
    expect(info.scaleNotes).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('E minor shares G major (1 sharp)', () => {
    const info = keySignatureInfo(E_MINOR)
    expect(info.accidentals).toEqual(['F#'])
    expect(info.relativeMajor).toBe('G')
    expect(info.why).toMatch(/G major/)
  })

  it('D minor shares F major (1 flat)', () => {
    const info = keySignatureInfo(D_MINOR)
    expect(info.accidentals).toEqual(['Bb'])
    expect(info.relativeMajor).toBe('F')
  })
})

import { describe, expect, it } from 'vitest'
import {
  COF_POSITIONS,
  pairIndexForKey,
  relativeOf,
  selectionFromWedge,
} from './circleData'
import { parseSpelling } from '../theory'

describe('Circle of Fifths data', () => {
  it('has 12 positions with matching relative pairs', () => {
    expect(COF_POSITIONS).toHaveLength(12)
    // C major (0) ↔ A minor
    expect(COF_POSITIONS[0]!.majorSpelling).toBe('C')
    expect(COF_POSITIONS[0]!.minorSpelling).toBe('A')
    // G major ↔ E minor
    expect(COF_POSITIONS[1]!.majorSpelling).toBe('G')
    expect(COF_POSITIONS[1]!.minorSpelling).toBe('E')
  })

  it('selectionFromWedge updates major/minor correctly', () => {
    expect(selectionFromWedge(0, 'major')).toEqual({
      key: 0,
      keySpelling: 'C',
      mode: 'major',
      pairIndex: 0,
    })
    expect(selectionFromWedge(0, 'minor')).toEqual({
      key: 9,
      keySpelling: 'A',
      mode: 'minor',
      pairIndex: 0,
    })
    expect(selectionFromWedge(1, 'major').keySpelling).toBe('G')
    expect(selectionFromWedge(11, 'major').keySpelling).toBe('F')
  })

  it('pairIndexForKey finds sharp and flat sides', () => {
    expect(pairIndexForKey(parseSpelling('F#'), 'major')).toBe(6)
    expect(pairIndexForKey(parseSpelling('Db'), 'major')).toBe(7)
    expect(pairIndexForKey(parseSpelling('A'), 'minor')).toBe(0)
  })

  it('relativeOf maps major↔minor tonics', () => {
    expect(relativeOf(0, 'major')).toBe(9) // C → A
    expect(relativeOf(9, 'minor')).toBe(0) // A → C
  })
})

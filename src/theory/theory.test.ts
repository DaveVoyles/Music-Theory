import { describe, expect, it } from 'vitest'
import {
  chordTonePitchClasses,
  chordToneSpellings,
  diatonicPitchClasses,
  diatonicSpellings,
  isDiatonic,
  parseSpelling,
  pitchClassForDegree,
  relativeMinorTonic,
  romanNumeral,
  scaleIntervals,
  spellPitchClass,
  type KeyRef,
  type PitchClass,
} from './index'

const C_MAJOR: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
const G_MAJOR: KeyRef = { tonic: 7, mode: 'major', tonicSpelling: 'G' }
const F_MAJOR: KeyRef = { tonic: 5, mode: 'major', tonicSpelling: 'F' }
const A_MINOR: KeyRef = { tonic: 9, mode: 'minor', tonicSpelling: 'A' }
const E_MINOR: KeyRef = { tonic: 4, mode: 'minor', tonicSpelling: 'E' }
const D_MINOR: KeyRef = { tonic: 2, mode: 'minor', tonicSpelling: 'D' }

describe('parseSpelling', () => {
  it('maps naturals, sharps, and flats to pitch classes', () => {
    expect(parseSpelling('C')).toBe(0)
    expect(parseSpelling('C#')).toBe(1)
    expect(parseSpelling('Db')).toBe(1)
    expect(parseSpelling('F#')).toBe(6)
    expect(parseSpelling('Bb')).toBe(10)
    expect(parseSpelling('B')).toBe(11)
  })
})

describe('major scales + key-aware spellings', () => {
  it('covers C major (no accidentals)', () => {
    expect(diatonicSpellings(C_MAJOR)).toEqual([
      'C',
      'D',
      'E',
      'F',
      'G',
      'A',
      'B',
    ])
    expect(diatonicPitchClasses(C_MAJOR)).toEqual([0, 2, 4, 5, 7, 9, 11])
  })

  it('covers a sharp key (G major → F#)', () => {
    expect(diatonicSpellings(G_MAJOR)).toEqual([
      'G',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F#',
    ])
    expect(diatonicPitchClasses(G_MAJOR)).toEqual([7, 9, 11, 0, 2, 4, 6])
  })

  it('covers a flat key (F major → Bb)', () => {
    expect(diatonicSpellings(F_MAJOR)).toEqual([
      'F',
      'G',
      'A',
      'Bb',
      'C',
      'D',
      'E',
    ])
    expect(diatonicPitchClasses(F_MAJOR)).toEqual([5, 7, 9, 10, 0, 2, 4])
  })

  it('marks only diatonic pitch classes', () => {
    expect(isDiatonic(C_MAJOR, 0)).toBe(true)
    expect(isDiatonic(C_MAJOR, 1)).toBe(false)
    expect(isDiatonic(G_MAJOR, 6)).toBe(true) // F#
    expect(isDiatonic(G_MAJOR, 5)).toBe(false) // F natural
  })
})

describe('minor forms (degrees 6/7)', () => {
  it('natural minor uses b6 and b7', () => {
    const key: KeyRef = { ...A_MINOR, minorForm: 'natural' }
    expect(scaleIntervals(key)).toEqual([0, 2, 3, 5, 7, 8, 10])
    expect(diatonicSpellings(key)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ])
    // degree 6 = F (pc 5), degree 7 = G (pc 7)
    expect(pitchClassForDegree(key, 6)).toBe(5)
    expect(pitchClassForDegree(key, 7)).toBe(7)
  })

  it('harmonic minor raises 7 only', () => {
    const key: KeyRef = { ...A_MINOR, minorForm: 'harmonic' }
    expect(scaleIntervals(key)).toEqual([0, 2, 3, 5, 7, 8, 11])
    expect(diatonicSpellings(key)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G#',
    ])
    expect(pitchClassForDegree(key, 6)).toBe(5)
    expect(pitchClassForDegree(key, 7)).toBe(8) // G#
  })

  it('melodic minor raises 6 and 7', () => {
    const key: KeyRef = { ...A_MINOR, minorForm: 'melodic' }
    expect(scaleIntervals(key)).toEqual([0, 2, 3, 5, 7, 9, 11])
    expect(diatonicSpellings(key)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F#',
      'G#',
    ])
    expect(pitchClassForDegree(key, 6)).toBe(6) // F#
    expect(pitchClassForDegree(key, 7)).toBe(8) // G#
  })

  it('sharp and flat minor keys keep letter-correct spellings', () => {
    // E natural minor (1 sharp: F#)
    expect(diatonicSpellings({ ...E_MINOR, minorForm: 'natural' })).toEqual([
      'E',
      'F#',
      'G',
      'A',
      'B',
      'C',
      'D',
    ])
    // D natural minor (1 flat: Bb)
    expect(diatonicSpellings({ ...D_MINOR, minorForm: 'natural' })).toEqual([
      'D',
      'E',
      'F',
      'G',
      'A',
      'Bb',
      'C',
    ])
    // D harmonic: raised 7 → C#
    expect(diatonicSpellings({ ...D_MINOR, minorForm: 'harmonic' })).toEqual([
      'D',
      'E',
      'F',
      'G',
      'A',
      'Bb',
      'C#',
    ])
  })
})

describe('degree → chord tones', () => {
  it('builds diatonic triads in C major', () => {
    // I = C E G
    expect(chordToneSpellings(C_MAJOR, 1)).toEqual(['C', 'E', 'G'])
    expect(chordTonePitchClasses(C_MAJOR, 1)).toEqual([0, 4, 7])
    // V = G B D
    expect(chordToneSpellings(C_MAJOR, 5)).toEqual(['G', 'B', 'D'])
    // vii° = B D F
    expect(chordToneSpellings(C_MAJOR, 7)).toEqual(['B', 'D', 'F'])
  })

  it('builds i and V in A harmonic minor', () => {
    const key: KeyRef = { ...A_MINOR, minorForm: 'harmonic' }
    expect(chordToneSpellings(key, 1)).toEqual(['A', 'C', 'E'])
    // V = E G# B (raised 7 as third of V)
    expect(chordToneSpellings(key, 5)).toEqual(['E', 'G#', 'B'])
  })

  it('exports major roman numerals for focus strip defaults', () => {
    expect(romanNumeral(C_MAJOR, 1)).toBe('I')
    expect(romanNumeral(C_MAJOR, 2)).toBe('ii')
    expect(romanNumeral(C_MAJOR, 7)).toBe('vii°')
  })
})

describe('spellPitchClass + relatives', () => {
  it('returns diatonic spelling for in-key notes', () => {
    expect(spellPitchClass(G_MAJOR, 6 as PitchClass)).toBe('F#')
    expect(spellPitchClass(F_MAJOR, 10 as PitchClass)).toBe('Bb')
  })

  it('relative minor of C is A (pc 9)', () => {
    expect(relativeMinorTonic(0 as PitchClass)).toBe(9)
  })
})

describe('engine purity', () => {
  it('does not import react (module surface is pure data)', async () => {
    // Structural: theory modules must not pull UI packages.
    // This test fails only if a future import re-exports react through the barrel.
    const mod = await import('./index')
    expect(mod.diatonicSpellings).toBeTypeOf('function')
    expect('useState' in mod).toBe(false)
    expect('create' in mod).toBe(false)
  })
})

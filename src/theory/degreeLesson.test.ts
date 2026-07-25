import { describe, expect, it } from 'vitest'
import { degreeLessonInfo, degreeLessonOverview } from './degreeLesson'
import type { KeyRef } from './types'

const C_MAJOR: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
const A_MINOR: KeyRef = { tonic: 9, mode: 'minor', tonicSpelling: 'A', minorForm: 'natural' }
const A_HARM: KeyRef = { tonic: 9, mode: 'minor', tonicSpelling: 'A', minorForm: 'harmonic' }

describe('degreeLessonInfo — major', () => {
  it('teaches I as tonic with C–E–G', () => {
    const info = degreeLessonInfo(C_MAJOR, 1)
    expect(info.roman).toBe('I')
    expect(info.degreeName).toBe('Tonic')
    expect(info.functionFamily).toBe('tonic')
    expect(info.chordTones).toEqual(['C', 'E', 'G'])
    expect(info.summary).toMatch(/I in C major/)
    expect(info.why).toMatch(/home/i)
    expect(info.tryThis.length).toBeGreaterThan(10)
  })

  it('teaches V as dominant G–B–D', () => {
    const info = degreeLessonInfo(C_MAJOR, 5)
    expect(info.roman).toBe('V')
    expect(info.degreeName).toBe('Dominant')
    expect(info.functionFamily).toBe('dominant')
    expect(info.chordTones).toEqual(['G', 'B', 'D'])
    expect(info.why).toMatch(/leading tone|resolve/i)
  })

  it('teaches ii as pre-dominant D–F–A', () => {
    const info = degreeLessonInfo(C_MAJOR, 2)
    expect(info.roman).toBe('ii')
    expect(info.chordTones).toEqual(['D', 'F', 'A'])
    expect(info.functionFamily).toBe('subdominant')
    expect(info.why).toMatch(/ii–V–I|pre-dominant/i)
  })

  it('teaches vii° diminished', () => {
    const info = degreeLessonInfo(C_MAJOR, 7)
    expect(info.roman).toBe('vii°')
    expect(info.chordTones).toEqual(['B', 'D', 'F'])
    expect(info.quality).toMatch(/diminished/)
  })
})

describe('degreeLessonInfo — minor', () => {
  it('natural v is minor; harmonic V is major', () => {
    const nat = degreeLessonInfo(A_MINOR, 5)
    expect(nat.roman).toBe('v')
    expect(nat.chordTones).toEqual(['E', 'G', 'B'])
    expect(nat.why).toMatch(/Raise the 7th|weaker/i)

    const harm = degreeLessonInfo(A_HARM, 5)
    expect(harm.roman).toBe('V')
    expect(harm.chordTones).toEqual(['E', 'G#', 'B'])
    expect(harm.why).toMatch(/raised|dominant/i)
  })

  it('i is tonic A–C–E', () => {
    const info = degreeLessonInfo(A_MINOR, 1)
    expect(info.roman).toBe('i')
    expect(info.chordTones).toEqual(['A', 'C', 'E'])
    expect(info.functionFamily).toBe('tonic')
  })
})

describe('degreeLessonOverview', () => {
  it('mentions function families when no degree focused', () => {
    expect(degreeLessonOverview(C_MAJOR)).toMatch(/Select a degree/)
    expect(degreeLessonOverview(C_MAJOR)).toMatch(/dominant/i)
    expect(degreeLessonOverview(A_MINOR)).toMatch(/i is home/)
  })
})

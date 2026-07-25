import { describe, expect, it } from 'vitest'
import { ascendingSemitones, intervalInfo } from './intervals'

describe('ascendingSemitones', () => {
  it('measures upward distance within the octave', () => {
    expect(ascendingSemitones(0, 0)).toBe(0) // C → C
    expect(ascendingSemitones(0, 7)).toBe(7) // C → G
    expect(ascendingSemitones(7, 0)).toBe(5) // G → C
    expect(ascendingSemitones(11, 0)).toBe(1) // B → C
  })
})

describe('intervalInfo', () => {
  it('names C → G a perfect fifth', () => {
    const info = intervalInfo(
      { pc: 0, spelling: 'C' },
      { pc: 7, spelling: 'G' },
    )
    expect(info.semitones).toBe(7)
    expect(info.short).toBe('P5')
    expect(info.name).toBe('Perfect fifth')
    expect(info.summary).toMatch(/Perfect fifth/)
    expect(info.why.length).toBeGreaterThan(20)
  })

  it('names C → E a major third and E → G a minor third', () => {
    expect(
      intervalInfo({ pc: 0, spelling: 'C' }, { pc: 4, spelling: 'E' }).short,
    ).toBe('M3')
    expect(
      intervalInfo({ pc: 4, spelling: 'E' }, { pc: 7, spelling: 'G' }).short,
    ).toBe('m3')
  })

  it('names F → B a tritone', () => {
    const info = intervalInfo(
      { pc: 5, spelling: 'F' },
      { pc: 11, spelling: 'B' },
    )
    expect(info.semitones).toBe(6)
    expect(info.name).toBe('Tritone')
  })

  it('unison for identical pitch classes', () => {
    const info = intervalInfo(
      { pc: 2, spelling: 'D' },
      { pc: 2, spelling: 'D' },
    )
    expect(info.short).toBe('P1')
    expect(info.semitones).toBe(0)
  })
})

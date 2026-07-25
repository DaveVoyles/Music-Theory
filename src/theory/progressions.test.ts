import { describe, expect, it } from 'vitest'
import { PROGRESSION_PRESETS, progressionsForMode } from './progressions'

describe('progressions', () => {
  it('includes the pop I–V–vi–IV progression', () => {
    const pop = PROGRESSION_PRESETS.find((p) => p.id === 'pop-1564')
    expect(pop?.degrees).toEqual([1, 5, 6, 4])
  })

  it('filters major vs minor presets', () => {
    const major = progressionsForMode('major')
    const minor = progressionsForMode('minor')
    expect(major.every((p) => p.modes.includes('major'))).toBe(true)
    expect(minor.every((p) => p.modes.includes('minor'))).toBe(true)
    expect(major.length).toBeGreaterThan(0)
    expect(minor.length).toBeGreaterThan(0)
  })
})

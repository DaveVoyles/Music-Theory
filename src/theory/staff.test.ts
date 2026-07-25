import { describe, expect, it } from 'vitest'
import { staffSignatureLayout } from './staff'

describe('staffSignatureLayout', () => {
  it('returns empty for natural / C major', () => {
    const layout = staffSignatureLayout('natural', [])
    expect(layout.count).toBe(0)
    expect(layout.positions).toHaveLength(0)
  })

  it('places one sharp for G major (F#)', () => {
    const layout = staffSignatureLayout('sharp', ['F#'])
    expect(layout.count).toBe(1)
    expect(layout.positions[0]!.glyph).toBe('♯')
    expect(layout.positions[0]!.spelling).toBe('F#')
    expect(layout.positions[0]!.staffY).toBe(1)
  })

  it('places two flats for Bb major', () => {
    const layout = staffSignatureLayout('flat', ['Bb', 'Eb'])
    expect(layout.count).toBe(2)
    expect(layout.positions[0]!.glyph).toBe('♭')
    expect(layout.positions[1]!.order).toBe(1)
  })

  it('orders three sharps left-to-right', () => {
    const layout = staffSignatureLayout('sharp', ['F#', 'C#', 'G#'])
    expect(layout.positions.map((p) => p.order)).toEqual([0, 1, 2])
  })
})

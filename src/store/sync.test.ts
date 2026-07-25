import { describe, expect, it } from 'vitest'
import { pairIndexForKey } from '../cof/circleData'
import { buildNeck } from '../fretboard/neck'
import { createTheoryStore, toKeyRef } from './theoryStore'

/**
 * Lightweight end-to-end sync checks: one store drives CoF pair index + neck
 * under rapid key / section-style jumps (plan 0001 D10).
 */
describe('workspace sync under rapid key changes', () => {
  it('CoF pair + neck root stay consistent across jumps', () => {
    const store = createTheoryStore({ persist: false })

    const jumps = [
      { key: 0 as const, keySpelling: 'C', mode: 'major' as const },
      { key: 7 as const, keySpelling: 'G', mode: 'major' as const },
      { key: 9 as const, keySpelling: 'A', mode: 'minor' as const, minorForm: 'harmonic' as const },
      { key: 5 as const, keySpelling: 'F', mode: 'major' as const },
      { key: 2 as const, keySpelling: 'D', mode: 'major' as const }, // analyzer-style section jump
    ]

    for (const jump of jumps) {
      store.getState().selectKey(jump)
      const s = store.getState()
      expect(s.focusDegree).toBeNull()
      expect(pairIndexForKey(s.key, s.mode)).toBeGreaterThanOrEqual(0)
      const neck = buildNeck(toKeyRef(s), s.focusDegree)
      const roots = neck.filter((c) => c.isRoot)
      expect(roots.length).toBeGreaterThan(0)
      expect(roots.every((c) => c.pc === s.key)).toBe(true)
      // diatonic labels use key-aware spellings for roots
      expect(roots.every((c) => c.spelling !== null)).toBe(true)
    }
  })
})

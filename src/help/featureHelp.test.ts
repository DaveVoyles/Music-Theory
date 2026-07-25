import { describe, expect, it } from 'vitest'
import { FEATURE_HELP } from './featureHelp'

describe('FEATURE_HELP catalog', () => {
  it('covers the main workspace surfaces', () => {
    for (const id of [
      'app',
      'keyBadge',
      'keyLesson',
      'circleOfFifths',
      'romanStrip',
      'degreeLesson',
      'quiz',
      'minorForm',
      'fretboard',
      'intervalLesson',
      'progression',
      'analyzer',
    ] as const) {
      const h = FEATURE_HELP[id]
      expect(h.title.length).toBeGreaterThan(3)
      expect(h.what.length).toBeGreaterThan(20)
      expect(h.how.length).toBeGreaterThan(20)
      expect(h.tryThis.length).toBeGreaterThan(10)
    }
  })
})

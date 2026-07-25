import { describe, expect, it } from 'vitest'
import { buildNeck } from '../fretboard/neck'
import { createTheoryStore, toKeyRef } from './theoryStore'

describe('focusDegree + minorForm → neck derived tones', () => {
  it('roman focus filters chord tones on the neck', () => {
    const store = createTheoryStore({ persist: false })
    store.getState().setFocusDegree(1) // I in C major = C E G
    const neck = buildNeck(toKeyRef(store.getState()), store.getState().focusDegree)
    const b = neck.find((c) => c.stringIndex === 0 && c.fret === 7)! // B
    const c = neck.find((c) => c.stringIndex === 1 && c.fret === 3)! // C
    expect(b.isChordTone).toBe(false)
    expect(c.isChordTone).toBe(true)
  })

  it('harmonic minor updates degree-7 spelling on the neck', () => {
    const store = createTheoryStore({ persist: false })
    store.getState().selectKey({
      key: 9,
      keySpelling: 'A',
      mode: 'minor',
      minorForm: 'natural',
    })
    let neck = buildNeck(toKeyRef(store.getState()), null)
    // G natural on Low E fret 3
    const gNat = neck.find((c) => c.stringIndex === 0 && c.fret === 3)!
    expect(gNat.spelling).toBe('G')

    store.getState().setMinorForm('harmonic')
    neck = buildNeck(toKeyRef(store.getState()), null)
    const gs = neck.find((c) => c.stringIndex === 0 && c.fret === 4)! // G#
    expect(gs.isDiatonic).toBe(true)
    expect(gs.spelling).toBe('G#')
  })
})

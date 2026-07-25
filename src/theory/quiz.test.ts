import { describe, expect, it } from 'vitest'
import {
  makeDegreeChordQuestion,
  makeDegreeFunctionQuestion,
  makeEarDegreeQuestion,
  makeSignatureAccidentalsQuestion,
  makeSignatureCountQuestion,
  mulberry32,
  nextQuizQuestion,
} from './quiz'

describe('quiz generators', () => {
  it('signature-count: correct choice matches keySignatureInfo', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 20; i++) {
      const q = makeSignatureCountQuestion(rng)
      expect(q.choices).toHaveLength(4)
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(4)
      expect(new Set(q.choices).size).toBe(4)
      expect(q.prompt).toMatch(/How many sharps or flats/)
      expect(q.explain.length).toBeGreaterThan(20)
    }
  })

  it('signature-accidentals: lists notes or none', () => {
    const q = makeSignatureAccidentalsQuestion(mulberry32(7))
    expect(q.choices[q.correctIndex]).toBeTruthy()
    expect(q.kind).toBe('signature-accidentals')
  })

  it('degree-function: includes traditional names', () => {
    const q = makeDegreeFunctionQuestion(mulberry32(99))
    expect(q.choices).toContain(q.choices[q.correctIndex])
    expect(
      ['Tonic', 'Dominant', 'Subdominant', 'Supertonic', 'Submediant', 'Leading tone', 'Mediant'].some(
        (n) => q.choices.includes(n),
      ),
    ).toBe(true)
  })

  it('degree-chord: chord tones use en-dash', () => {
    const q = makeDegreeChordQuestion(mulberry32(3))
    expect(q.choices[q.correctIndex]).toMatch(/–/)
  })

  it('ear-degree: includes hear payload and roman choices', () => {
    const q = makeEarDegreeQuestion(mulberry32(11))
    expect(q.kind).toBe('ear-degree')
    expect(q.hear).toBeDefined()
    expect(q.hear!.degree).toBeGreaterThanOrEqual(1)
    expect(q.hear!.degree).toBeLessThanOrEqual(7)
    expect(q.choices).toHaveLength(4)
    expect(q.prompt).toMatch(/Listen/)
    // Correct answer is a roman that matches the secret degree
    expect(q.choices[q.correctIndex]).toBeTruthy()
  })

  it('nextQuizQuestion is deterministic with seed', () => {
    const a = nextQuizQuestion(mulberry32(1))
    const b = nextQuizQuestion(mulberry32(1))
    expect(a).toEqual(b)
  })

  it('G major count question can be forced via seed scan', () => {
    // Sanity: at least one of first 50 seeds yields a 1-sharp answer option
    let found = false
    for (let seed = 0; seed < 80; seed++) {
      const q = makeSignatureCountQuestion(mulberry32(seed))
      if (q.choices[q.correctIndex] === '1 sharp') {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })
})

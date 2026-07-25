import { describe, expect, it, vi } from 'vitest'
import {
  createTheoryAudio,
  pcToNoteName,
  triadNoteNames,
  type SynthLike,
  type ToneLike,
} from './theoryAudio'
import type { KeyRef } from '../theory'

const C_MAJOR: KeyRef = { tonic: 0, mode: 'major', tonicSpelling: 'C' }
const A_HARM: KeyRef = {
  tonic: 9,
  mode: 'minor',
  tonicSpelling: 'A',
  minorForm: 'harmonic',
}

function mockTone(synth: SynthLike): ToneLike {
  return {
    start: vi.fn(async () => {
      mockToneState.state = 'running'
    }),
    context: mockToneState,
    PolySynth: vi.fn(function PolySynth() {
      return synth
    }) as unknown as ToneLike['PolySynth'],
    Synth: vi.fn() as unknown as ToneLike['Synth'],
  }
}

const mockToneState = { state: 'suspended' }

describe('pcToNoteName / triadNoteNames', () => {
  it('maps pitch classes to scientific names', () => {
    expect(pcToNoteName(0, 4)).toBe('C4')
    expect(pcToNoteName(6, 3)).toBe('F#3')
  })

  it('builds C major triad C-E-G', () => {
    expect(triadNoteNames(C_MAJOR)).toEqual(['C4', 'E4', 'G4'])
  })

  it('builds A harmonic minor tonic triad A-C-E', () => {
    expect(triadNoteNames(A_HARM)).toEqual(['A4', 'C5', 'E5'])
  })
})

describe('createTheoryAudio', () => {
  it('primes on first play and triggers pitch', async () => {
    mockToneState.state = 'suspended'
    const trigger = vi.fn()
    const synth: SynthLike = {
      triggerAttackRelease: trigger,
      toDestination() {
        return this
      },
    }
    const audio = createTheoryAudio({
      loadTone: async () => mockTone(synth),
      synth,
    })

    expect(audio.isPrimed()).toBe(false)
    await audio.playPitch(0, 4)
    expect(audio.isPrimed()).toBe(true)
    expect(trigger).toHaveBeenCalledWith('C4', '8n')
  })

  it('plays triad after prime', async () => {
    mockToneState.state = 'running'
    const trigger = vi.fn()
    const synth: SynthLike = {
      triggerAttackRelease: trigger,
      toDestination() {
        return this
      },
    }
    const audio = createTheoryAudio({
      loadTone: async () => mockTone(synth),
      synth,
    })
    await audio.playTriad(C_MAJOR)
    expect(trigger).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '4n')
  })
})

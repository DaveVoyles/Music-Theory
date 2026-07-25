import { describe, expect, it, vi } from 'vitest'
import {
  createTheoryAudio,
  degreeTriadNoteNames,
  midiToNoteName,
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

  it('builds degree triads (V in C = G-B-D)', () => {
    expect(degreeTriadNoteNames(C_MAJOR, 5)).toEqual(['G4', 'B4', 'D5'])
    expect(degreeTriadNoteNames(C_MAJOR, 2)).toEqual(['D4', 'F4', 'A4'])
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

  it('plays a non-tonic degree triad', async () => {
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
    await audio.playDegreeTriad(C_MAJOR, 5)
    expect(trigger).toHaveBeenCalledWith(['G4', 'B4', 'D5'], '4n')
  })

  it('maps MIDI to scientific pitch', () => {
    expect(midiToNoteName(40)).toBe('E2')
    expect(midiToNoteName(60)).toBe('C4')
    expect(midiToNoteName(64)).toBe('E4')
  })

  it('plays absolute MIDI notes for fretted pitches', async () => {
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
    await audio.playMidi(40) // low E
    expect(trigger).toHaveBeenCalledWith('E2', '8n')
  })

  it('plays a progression of degree triads with offsets', async () => {
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
    await audio.playProgression(C_MAJOR, [1, 5, 6], 0.5)
    expect(trigger).toHaveBeenCalledTimes(3)
    expect(trigger.mock.calls[0]![0]).toEqual(['C4', 'E4', 'G4'])
    expect(trigger.mock.calls[1]![2]).toBe('+0.500')
  })

  it('plays an ascending interval then the dyad', async () => {
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
    await audio.playInterval(0, 7) // C → G
    expect(trigger).toHaveBeenCalledWith('C4', '8n')
    expect(trigger).toHaveBeenCalledWith('G4', '8n', '+0.28')
    expect(trigger).toHaveBeenCalledWith(['C4', 'G4'], '4n', '+0.55')
  })
})

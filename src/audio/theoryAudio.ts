import type { KeyRef, PitchClass } from '../theory'
import { chordTonePitchClasses } from '../theory'

/** Minimal synth surface so tests can inject a mock without loading Tone. */
export interface SynthLike {
  triggerAttackRelease: (
    note: string | string[],
    duration: string | number,
    time?: number,
    velocity?: number,
  ) => void
  dispose?: () => void
  toDestination?: () => SynthLike
}

export interface ToneLike {
  start: () => Promise<void>
  context: { state: string }
  PolySynth: new (...args: unknown[]) => SynthLike
  Synth: new (...args: unknown[]) => unknown
}

export interface TheoryAudio {
  /** Ensure AudioContext is running (must be called from a user gesture). */
  prime: () => Promise<void>
  /** Play a single pitch class (default octave 4 for mid-neck feel). */
  playPitch: (pc: PitchClass, octave?: number) => Promise<void>
  /** Play tonic triad for the given key/mode/minor form. */
  playTriad: (key: KeyRef) => Promise<void>
  /** True after a successful prime. */
  isPrimed: () => boolean
}

const NOTE_NAMES_SHARP = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

/** Convert pitch class + octave to scientific pitch notation for Tone. */
export function pcToNoteName(pc: PitchClass, octave = 4): string {
  return `${NOTE_NAMES_SHARP[pc]}${octave}`
}

/** Chord-tone note names for a tonic triad (root-position voicing). */
export function triadNoteNames(key: KeyRef, octave = 4): string[] {
  const [r, third, fifth] = chordTonePitchClasses(key, 1)
  // Keep a compact voicing: root, third, fifth in same octave band
  const root = pcToNoteName(r, octave)
  let thirdOct = octave
  let fifthOct = octave
  if (third < r) thirdOct = octave + 1
  if (fifth < r) fifthOct = octave + 1
  // If third went up and fifth is still below third in pitch order...
  if (fifth < third && fifthOct === thirdOct) {
    // fine for many shapes
  }
  return [root, pcToNoteName(third, thirdOct), pcToNoteName(fifth, fifthOct)]
}

export interface CreateTheoryAudioOptions {
  /** Inject Tone-like module (tests). Default: dynamic import('tone'). */
  loadTone?: () => Promise<ToneLike>
  /** Optional prebuilt synth (tests). */
  synth?: SynthLike
}

/**
 * Tone.js-backed aural feedback. AudioContext is only started inside `prime`,
 * which callers must invoke from a user gesture (click).
 */
export function createTheoryAudio(options: CreateTheoryAudioOptions = {}): TheoryAudio {
  let primed = false
  let tone: ToneLike | null = null
  let synth: SynthLike | null = options.synth ?? null

  async function ensureTone(): Promise<ToneLike> {
    if (tone) return tone
    if (options.loadTone) {
      tone = await options.loadTone()
    } else {
      // Dynamic import keeps Tone out of unit-test graph unless requested.
      const mod = (await import('tone')) as unknown as ToneLike
      tone = mod
    }
    return tone
  }

  async function ensureSynth(): Promise<SynthLike> {
    if (synth) return synth
    const t = await ensureTone()
    const poly = new t.PolySynth(t.Synth as never, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4 },
    } as never)
    if (poly.toDestination) poly.toDestination()
    synth = poly
    return synth
  }

  return {
    isPrimed: () => primed,

    async prime() {
      const t = await ensureTone()
      if (t.context.state !== 'running') {
        await t.start()
      }
      await ensureSynth()
      primed = true
    },

    async playPitch(pc, octave = 4) {
      await this.prime()
      const s = await ensureSynth()
      s.triggerAttackRelease(pcToNoteName(pc, octave), '8n')
    },

    async playTriad(key) {
      await this.prime()
      const s = await ensureSynth()
      s.triggerAttackRelease(triadNoteNames(key), '4n')
    },
  }
}

/** App singleton. */
export const theoryAudio = createTheoryAudio()

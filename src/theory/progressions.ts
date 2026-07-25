/**
 * Common diatonic progressions for practice / ear training.
 */

import type { Degree, Mode } from './types'

export interface ProgressionPreset {
  id: string
  /** Display name */
  name: string
  /** Short tag, e.g. "pop" */
  tag: string
  /** Degrees in order (major roman sense; minor uses parallel degrees). */
  degrees: readonly Degree[]
  /** Modes this progression is most useful in. */
  modes: readonly Mode[]
}

export const PROGRESSION_PRESETS: readonly ProgressionPreset[] = [
  {
    id: 'pop-1564',
    name: 'I–V–vi–IV',
    tag: 'pop',
    degrees: [1, 5, 6, 4],
    modes: ['major'],
  },
  {
    id: 'classic-1451',
    name: 'I–IV–V–I',
    tag: 'classic',
    degrees: [1, 4, 5, 1],
    modes: ['major'],
  },
  {
    id: 'jazz-251',
    name: 'ii–V–I',
    tag: 'jazz',
    degrees: [2, 5, 1],
    modes: ['major'],
  },
  {
    id: '50s',
    name: 'I–vi–IV–V',
    tag: '50s',
    degrees: [1, 6, 4, 5],
    modes: ['major'],
  },
  {
    id: 'minor-i-VI-III-VII',
    name: 'i–VI–III–VII',
    tag: 'aeolian',
    degrees: [1, 6, 3, 7],
    modes: ['minor'],
  },
  {
    id: 'minor-i-iv-V-i',
    name: 'i–iv–V–i',
    tag: 'cadential',
    degrees: [1, 4, 5, 1],
    modes: ['minor'],
  },
  {
    id: 'minor-i-VII-VI-VII',
    name: 'i–VII–VI–VII',
    tag: 'rock',
    degrees: [1, 7, 6, 7],
    modes: ['minor'],
  },
] as const

/** Presets that fit the current mode (major or minor). */
export function progressionsForMode(mode: Mode): readonly ProgressionPreset[] {
  return PROGRESSION_PRESETS.filter((p) => p.modes.includes(mode))
}

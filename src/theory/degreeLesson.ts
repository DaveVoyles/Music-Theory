/**
 * Scale-degree pedagogy: function names, harmonic roles, chord tones,
 * and short “why / try this” copy for the selected degree in a key.
 */

import {
  chordToneSpellings,
  romanNumeral,
} from './degrees'
import { defaultTonicSpelling } from './spellings'
import type { Degree, KeyRef, Mode, NoteSpelling } from './types'

/** Classic function families (where the chord “pulls” in a progression). */
export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant' | 'mediant' | 'leading'

export interface DegreeLessonInfo {
  degree: Degree
  roman: string
  /** Tonic / subdominant / dominant family (and lighter labels). */
  functionFamily: HarmonicFunction
  /** Traditional scale-degree name: Tonic, Dominant, … */
  degreeName: string
  /** Chord quality blurb for this mode (e.g. “major triad”). */
  quality: string
  chordTones: readonly [NoteSpelling, NoteSpelling, NoteSpelling]
  /** One-line fact: “V in C major is G–B–D, the dominant.” */
  summary: string
  why: string
  /** Common moves involving this degree. */
  tryThis: string
  /** Key context label for the UI. */
  keyLabel: string
}

const MAJOR_DEGREE_NAMES = [
  'Tonic',
  'Supertonic',
  'Mediant',
  'Subdominant',
  'Dominant',
  'Submediant',
  'Leading tone',
] as const

const MINOR_DEGREE_NAMES = [
  'Tonic',
  'Supertonic',
  'Mediant',
  'Subdominant',
  'Dominant',
  'Submediant',
  'Subtonic', // natural minor; harmonic uses leading tone on 7
] as const

/** Primary function family by degree (1-indexed), major diatonic. */
const MAJOR_FAMILY: readonly HarmonicFunction[] = [
  'tonic',
  'subdominant', // ii often pre-dominant
  'tonic', // iii shares tonic color
  'subdominant',
  'dominant',
  'tonic', // vi relative, tonic substitute
  'dominant', // vii°
]

/** Natural-minor-oriented families (harmonic V treated as dominant in copy). */
const MINOR_FAMILY: readonly HarmonicFunction[] = [
  'tonic',
  'subdominant',
  'mediant',
  'subdominant',
  'dominant',
  'mediant',
  'dominant', // VII natural / leading in harmonic
]

function qualityFor(mode: Mode, degree: Degree, minorForm?: string): string {
  if (mode === 'major') {
    const q = [
      'major triad',
      'minor triad',
      'minor triad',
      'major triad',
      'major triad',
      'minor triad',
      'diminished triad',
    ] as const
    return q[degree - 1]!
  }
  // natural minor defaults; harmonic/melodic notes called out in why
  if (minorForm === 'harmonic') {
    const q = [
      'minor triad',
      'diminished triad',
      'augmented triad',
      'minor triad',
      'major triad',
      'major triad',
      'diminished triad',
    ] as const
    return q[degree - 1]!
  }
  if (minorForm === 'melodic') {
    const q = [
      'minor triad',
      'minor triad',
      'augmented triad',
      'major triad',
      'major triad',
      'diminished triad',
      'diminished triad',
    ] as const
    return q[degree - 1]!
  }
  const q = [
    'minor triad',
    'diminished triad',
    'major triad',
    'minor triad',
    'minor triad',
    'major triad',
    'major triad',
  ] as const
  return q[degree - 1]!
}

function majorWhy(degree: Degree, roman: string, tones: string): string {
  switch (degree) {
    case 1:
      return `${roman} is home. Progressions feel “finished” when they land here. Built on scale degree 1: ${tones}.`
    case 2:
      return `${roman} is a pre-dominant (subdominant family). It often prepares V — the classic ii–V–I uses this step: ${tones}.`
    case 3:
      return `${roman} shares two notes with I and softens the tonic color. Less common as a goal; useful for gentle motion: ${tones}.`
    case 4:
      return `${roman} is the subdominant — “away from home” without the sharp pull of V. Plagal motion IV→I (“Amen”) is common: ${tones}.`
    case 5:
      return `${roman} is the dominant. It contains the leading tone and wants to resolve to I. Strongest cadential chord: ${tones}.`
    case 6:
      return `${roman} is the relative minor of I (same notes as the vi chord). V→vi is the deceptive cadence — expected I, get ${roman}: ${tones}.`
    case 7:
      return `${roman} is built on the leading tone. Diminished triad pulls hard toward I; often substitutes for V in voice-leading: ${tones}.`
  }
}

function minorWhy(
  degree: Degree,
  roman: string,
  tones: string,
  minorForm: string,
): string {
  switch (degree) {
    case 1:
      return `${roman} is the minor tonic — home base for the key. Chord tones: ${tones}.`
    case 2:
      return `${roman} is a diminished pre-dominant in natural minor; it still leans toward v or V: ${tones}.`
    case 3:
      return `${roman} is the relative major of the minor tonic (same notes as the III chord). Bright color inside a minor key: ${tones}.`
    case 4:
      return `${roman} is the minor subdominant — common in ballads and progressions like i–iv–i: ${tones}.`
    case 5:
      if (minorForm === 'harmonic' || minorForm === 'melodic') {
        return `${roman} is major here because degree 7 is raised — a true dominant that resolves strongly to i. Chord: ${tones}.`
      }
      return `${roman} is a minor triad in natural minor (weaker pull). Raise the 7th (harmonic minor) to get a major V: ${tones}.`
    case 6:
      return `${roman} is a major triad a half-step above v — common in Aeolian rock moves (i–VI–III–VII): ${tones}.`
    case 7:
      if (minorForm === 'harmonic' || minorForm === 'melodic') {
        return `${roman} uses the raised leading tone and pulls to i like a dominant substitute: ${tones}.`
      }
      return `${roman} is the subtonic (whole step below tonic) in natural minor — modal flavor, less “leading” than a raised 7: ${tones}.`
  }
}

function majorTryThis(degree: Degree): string {
  switch (degree) {
    case 1:
      return 'Play I → any chord → back to I. Hear resolution when you return.'
    case 2:
      return 'In this key, try ii → V → I on the neck (focus each degree in turn).'
    case 3:
      return 'Compare I and iii frets — shared tones make a soft shift.'
    case 4:
      return 'Play IV → I (plagal). Then IV → V → I and compare the stronger V pull.'
    case 5:
      return 'Focus V, then I. That tension → release is the core of tonal music.'
    case 6:
      return 'Play V then vi instead of I — classic deceptive move.'
    case 7:
      return 'Spotlight vii°, then I. The half-step into the tonic is the leading-tone pull.'
  }
}

function minorTryThis(degree: Degree, minorForm: string): string {
  switch (degree) {
    case 1:
      return 'Establish i, wander, return — same “home” feeling as major I.'
    case 2:
      return 'Try ii° → V → i (with harmonic minor form for a strong V).'
    case 3:
      return 'Switch the Circle to the relative major on the same spoke — same notes, different home.'
    case 4:
      return 'i → iv → i is a staple minor vamp; focus iv then i on the neck.'
    case 5:
      return minorForm === 'natural'
        ? 'Toggle Harmonic form and watch v become V — then resolve to i.'
        : 'Focus V, then i — same dominant→tonic story as major.'
    case 6:
      return 'Try i → VI → III → VII (Aeolian loop) using degree focus.'
    case 7:
      return minorForm === 'natural'
        ? 'Compare natural VII with Harmonic vii° — whole-step vs leading-tone pull.'
        : 'Focus vii°, then i — leading-tone resolution in minor.'
  }
}

function familyLabel(f: HarmonicFunction): string {
  switch (f) {
    case 'tonic':
      return 'tonic function'
    case 'subdominant':
      return 'subdominant (pre-dominant) function'
    case 'dominant':
      return 'dominant function'
    case 'mediant':
      return 'mediant / color function'
    case 'leading':
      return 'leading-tone function'
  }
}

/**
 * Teaching payload for one scale degree in the given key.
 */
export function degreeLessonInfo(key: KeyRef, degree: Degree): DegreeLessonInfo {
  const roman = romanNumeral(key, degree)
  const chordTones = chordToneSpellings(key, degree)
  const tones = chordTones.join('–')
  const keyLabel =
    key.mode === 'minor'
      ? `${defaultTonicSpelling(key)} minor`
      : `${defaultTonicSpelling(key)} major`
  const minorForm = key.minorForm ?? 'natural'
  const degreeName =
    key.mode === 'major'
      ? MAJOR_DEGREE_NAMES[degree - 1]!
      : degree === 7 && (minorForm === 'harmonic' || minorForm === 'melodic')
        ? 'Leading tone'
        : MINOR_DEGREE_NAMES[degree - 1]!

  const functionFamily =
    key.mode === 'major' ? MAJOR_FAMILY[degree - 1]! : MINOR_FAMILY[degree - 1]!

  const quality = qualityFor(key.mode, degree, minorForm)
  const why =
    key.mode === 'major'
      ? majorWhy(degree, roman, tones)
      : minorWhy(degree, roman, tones, minorForm)
  const tryThis =
    key.mode === 'major' ? majorTryThis(degree) : minorTryThis(degree, minorForm)

  const summary = `${roman} in ${keyLabel} is ${tones} (${quality}) — the ${degreeName.toLowerCase()}, with ${familyLabel(functionFamily)}.`

  return {
    degree,
    roman,
    functionFamily,
    degreeName,
    quality,
    chordTones,
    summary,
    why,
    tryThis,
    keyLabel,
  }
}

/** Overview line when no degree is focused. */
export function degreeLessonOverview(key: KeyRef): string {
  const keyLabel =
    key.mode === 'minor'
      ? `${defaultTonicSpelling(key)} minor`
      : `${defaultTonicSpelling(key)} major`
  if (key.mode === 'major') {
    return `In ${keyLabel}, I and vi feel like home (tonic), IV and ii prepare motion (subdominant), V and vii° create pull (dominant). Select a degree to learn its chord and role.`
  }
  return `In ${keyLabel}, i is home; iv prepares; v/V pulls back (raise 7 for a strong V). Select a degree to learn its chord and role.`
}

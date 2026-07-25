/**
 * Teaching quiz generators — multiple-choice drills from key signatures
 * and degree-function lessons. Pure (injectable RNG for tests).
 */

import { degreeLessonInfo } from './degreeLesson'
import { keySignatureInfo } from './keySignature'
import type { Degree, KeyRef, Mode, NoteSpelling } from './types'

export type QuizKind =
  | 'signature-count'
  | 'signature-accidentals'
  | 'degree-function'
  | 'degree-chord'
  | 'ear-degree'

export interface QuizQuestion {
  kind: QuizKind
  prompt: string
  /** Four shuffled choices; exactly one is correct. */
  choices: readonly string[]
  correctIndex: number
  /** Shown after answer — reinforces the lesson engine copy. */
  explain: string
  /** Optional workspace jump when user wants to explore the answer. */
  explore?: {
    keySpelling: NoteSpelling
    mode: Mode
    degree?: Degree
  }
  /** When set, QuizPanel plays this degree triad (ear training). */
  hear?: {
    key: KeyRef
    degree: Degree
  }
}

/** Common major keys for drills (matches CoF major spellings). */
export const QUIZ_MAJOR_KEYS: readonly KeyRef[] = [
  { tonic: 0, mode: 'major', tonicSpelling: 'C' },
  { tonic: 7, mode: 'major', tonicSpelling: 'G' },
  { tonic: 2, mode: 'major', tonicSpelling: 'D' },
  { tonic: 9, mode: 'major', tonicSpelling: 'A' },
  { tonic: 4, mode: 'major', tonicSpelling: 'E' },
  { tonic: 5, mode: 'major', tonicSpelling: 'F' },
  { tonic: 10, mode: 'major', tonicSpelling: 'Bb' },
  { tonic: 3, mode: 'major', tonicSpelling: 'Eb' },
] as const

export const QUIZ_MINOR_KEYS: readonly KeyRef[] = [
  { tonic: 9, mode: 'minor', tonicSpelling: 'A', minorForm: 'natural' },
  { tonic: 4, mode: 'minor', tonicSpelling: 'E', minorForm: 'natural' },
  { tonic: 2, mode: 'minor', tonicSpelling: 'D', minorForm: 'natural' },
] as const

export type Rng = () => number // [0, 1)

/** Mulberry32 — deterministic sequence from a seed (tests). */
export function mulberry32(seed: number): Rng {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length) % items.length]!
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

function uniqueChoices(
  correct: string,
  distractors: readonly string[],
  rng: Rng,
  count = 4,
): { choices: string[]; correctIndex: number } {
  const pool = new Set<string>([correct])
  for (const d of distractors) {
    if (d !== correct) pool.add(d)
  }
  // Pad with generic fallbacks if needed
  const fallbacks = ['0', '1', '2', '3', '4', '5', '6', 'none', 'I', 'V', 'IV', 'ii']
  for (const f of fallbacks) {
    if (pool.size >= count) break
    if (f !== correct) pool.add(f)
  }
  const others = shuffle([...pool].filter((c) => c !== correct), rng).slice(
    0,
    count - 1,
  )
  const choices = shuffle([correct, ...others], rng)
  return {
    choices,
    correctIndex: choices.indexOf(correct),
  }
}

function formatCountAnswer(info: ReturnType<typeof keySignatureInfo>): string {
  if (info.count === 0) return '0 (none)'
  if (info.kind === 'sharp') {
    return info.count === 1 ? '1 sharp' : `${info.count} sharps`
  }
  return info.count === 1 ? '1 flat' : `${info.count} flats`
}

function formatAccidentalsAnswer(
  info: ReturnType<typeof keySignatureInfo>,
): string {
  if (info.count === 0) return 'none'
  return info.accidentals.join(', ')
}

export function makeSignatureCountQuestion(rng: Rng = Math.random): QuizQuestion {
  const key = pick(QUIZ_MAJOR_KEYS, rng)
  const info = keySignatureInfo(key)
  const correct = formatCountAnswer(info)
  const distractors = QUIZ_MAJOR_KEYS.map((k) =>
    formatCountAnswer(keySignatureInfo(k)),
  )
  const { choices, correctIndex } = uniqueChoices(correct, distractors, rng)
  return {
    kind: 'signature-count',
    prompt: `How many sharps or flats are in the key of ${info.keyLabel}?`,
    choices,
    correctIndex,
    explain: `${info.summary} ${info.why}`,
    explore: {
      keySpelling: key.tonicSpelling!,
      mode: 'major',
    },
  }
}

export function makeSignatureAccidentalsQuestion(
  rng: Rng = Math.random,
): QuizQuestion {
  // Prefer keys with ≥1 accidental so “none” isn’t always correct
  const withAcc = QUIZ_MAJOR_KEYS.filter(
    (k) => keySignatureInfo(k).count > 0,
  )
  const key = pick(withAcc.length ? withAcc : QUIZ_MAJOR_KEYS, rng)
  const info = keySignatureInfo(key)
  const correct = formatAccidentalsAnswer(info)
  const distractors = QUIZ_MAJOR_KEYS.map((k) =>
    formatAccidentalsAnswer(keySignatureInfo(k)),
  )
  const { choices, correctIndex } = uniqueChoices(correct, distractors, rng)
  return {
    kind: 'signature-accidentals',
    prompt: `Which accidentals are in the key signature of ${info.keyLabel}?`,
    choices,
    correctIndex,
    explain: `${info.summary} ${info.howToRemember}`,
    explore: {
      keySpelling: key.tonicSpelling!,
      mode: 'major',
    },
  }
}

export function makeDegreeFunctionQuestion(rng: Rng = Math.random): QuizQuestion {
  const key = pick(QUIZ_MAJOR_KEYS, rng)
  const degree = pick([1, 4, 5, 2, 6, 7] as const, rng) as Degree
  const info = degreeLessonInfo(key, degree)
  const correct = info.degreeName
  const distractors = [1, 2, 3, 4, 5, 6, 7].map(
    (d) => degreeLessonInfo(key, d as Degree).degreeName,
  )
  const { choices, correctIndex } = uniqueChoices(correct, distractors, rng)
  return {
    kind: 'degree-function',
    prompt: `In ${info.keyLabel}, what is the traditional name of ${info.roman}?`,
    choices,
    correctIndex,
    explain: info.summary + ' ' + info.why,
    explore: {
      keySpelling: key.tonicSpelling!,
      mode: 'major',
      degree,
    },
  }
}

const CHORD_QUIZ_KEYS: readonly KeyRef[] = [
  { tonic: 0, mode: 'major', tonicSpelling: 'C' },
  { tonic: 7, mode: 'major', tonicSpelling: 'G' },
  { tonic: 5, mode: 'major', tonicSpelling: 'F' },
]

export function makeDegreeChordQuestion(rng: Rng = Math.random): QuizQuestion {
  const key = pick(CHORD_QUIZ_KEYS, rng)
  const degree = pick([1, 4, 5, 2, 6] as const, rng) as Degree
  const info = degreeLessonInfo(key, degree)
  const correct = info.chordTones.join('–')
  const distractors = [1, 2, 3, 4, 5, 6, 7].map((d) =>
    degreeLessonInfo(key, d as Degree).chordTones.join('–'),
  )
  const { choices, correctIndex } = uniqueChoices(correct, distractors, rng)
  return {
    kind: 'degree-chord',
    prompt: `What are the chord tones of ${info.roman} in ${info.keyLabel}?`,
    choices,
    correctIndex,
    explain: info.summary,
    explore: {
      keySpelling: key.tonicSpelling!,
      mode: 'major',
      degree,
    },
  }
}

const EAR_DEGREES = [1, 2, 4, 5, 6] as const satisfies readonly Degree[]

/**
 * Ear training: hear a degree triad in a major key, pick the roman numeral.
 * Prompt does not name the degree — use `hear` + Replay in the UI.
 */
export function makeEarDegreeQuestion(rng: Rng = Math.random): QuizQuestion {
  const key = pick(QUIZ_MAJOR_KEYS, rng)
  const degree = pick(EAR_DEGREES, rng)
  const info = degreeLessonInfo(key, degree)
  const correct = info.roman
  const distractors = EAR_DEGREES.map(
    (d) => degreeLessonInfo(key, d).roman,
  )
  // Pad with iii / vii° so uniqueChoices always has enough distinct romans
  const extra = [3, 7].map((d) => degreeLessonInfo(key, d as Degree).roman)
  const { choices, correctIndex } = uniqueChoices(
    correct,
    [...distractors, ...extra],
    rng,
  )
  return {
    kind: 'ear-degree',
    prompt: `Listen to the triad in ${info.keyLabel}, then pick which scale degree it is.`,
    choices,
    correctIndex,
    explain: `${info.summary} ${info.why}`,
    explore: {
      keySpelling: key.tonicSpelling!,
      mode: 'major',
      degree,
    },
    hear: { key, degree },
  }
}

const MAKERS: readonly ((rng: Rng) => QuizQuestion)[] = [
  makeSignatureCountQuestion,
  makeSignatureAccidentalsQuestion,
  makeDegreeFunctionQuestion,
  makeDegreeChordQuestion,
  makeEarDegreeQuestion,
]

/** Next random question (evenly mixed kinds). */
export function nextQuizQuestion(rng: Rng = Math.random): QuizQuestion {
  return pick(MAKERS, rng)(rng)
}

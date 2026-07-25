import { create, type StateCreator, type StoreApi, type UseBoundStore } from 'zustand'
import {
  createJSONStorage,
  persist,
  type PersistOptions,
  type StateStorage,
} from 'zustand/middleware'
import type {
  Degree,
  KeyRef,
  MinorForm,
  Mode,
  NoteSpelling,
  PitchClass,
  PitchPick,
} from '../theory'
import { parseSpelling } from '../theory'

export const THEORY_STORAGE_KEY = 'music-theory:theory-ui'

/** How note labels are drawn on the fretboard. */
export type NeckLabelMode = 'notes' | 'degrees'

/** Persisted theory UI state (plan 0001 D3). */
export interface TheoryUiState {
  /** Tonic pitch class (C = 0). */
  key: PitchClass
  /** Key-aware tonic spelling for the selected key. */
  keySpelling: NoteSpelling
  mode: Mode
  minorForm: MinorForm
  /** Optional roman-numeral focus; null = all diatonic (no filter). */
  focusDegree: Degree | null
  /** Fretboard labels: note names vs scale-degree numbers (1–7). */
  neckLabelMode: NeckLabelMode
  /** First pitch in the interval lesson pair (fret or prior key). */
  intervalA: PitchPick | null
  /** Second pitch in the interval lesson pair. */
  intervalB: PitchPick | null
}

export interface TheoryUiActions {
  setKey: (key: PitchClass, spelling?: NoteSpelling) => void
  setMode: (mode: Mode) => void
  setMinorForm: (minorForm: MinorForm) => void
  setFocusDegree: (degree: Degree | null) => void
  /** Toggle focus: same degree again clears (roman strip UX). */
  toggleFocusDegree: (degree: Degree) => void
  setNeckLabelMode: (mode: NeckLabelMode) => void
  toggleNeckLabelMode: () => void
  /** Record a fret click for the interval lesson (A, then B, then replace B). */
  pickIntervalNote: (pick: PitchPick) => void
  clearIntervalPicks: () => void
  /** Apply a full key selection (e.g. CoF click or analyzer section jump). */
  selectKey: (input: {
    key: PitchClass
    keySpelling?: NoteSpelling
    mode: Mode
    minorForm?: MinorForm
  }) => void
  /** Reset to cold-start defaults (does not clear other localStorage keys). */
  resetTheoryUi: () => void
}

export type TheoryStore = TheoryUiState & TheoryUiActions

export const DEFAULT_THEORY_UI: TheoryUiState = {
  key: 0,
  keySpelling: 'C',
  mode: 'major',
  minorForm: 'natural',
  focusDegree: null,
  neckLabelMode: 'notes',
  intervalA: null,
  intervalB: null,
}

export function toKeyRef(state: TheoryUiState): KeyRef {
  return {
    tonic: state.key,
    tonicSpelling: state.keySpelling,
    mode: state.mode,
    minorForm: state.minorForm,
  }
}

function resolveSpelling(key: PitchClass, spelling?: NoteSpelling): NoteSpelling {
  if (spelling) {
    if (parseSpelling(spelling) !== key) {
      throw new Error(`Spelling ${spelling} does not match pitch class ${key}`)
    }
    return spelling
  }
  const names: NoteSpelling[] = [
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
  ]
  return names[key]!
}

export interface CreateTheoryStoreOptions {
  /** Inject storage for tests; default localStorage via zustand JSON storage. */
  storage?: StateStorage
  /** Skip persist middleware (unit tests that only care about in-memory). */
  persist?: boolean
}

type TheoryPersist = {
  persist: {
    hasHydrated: () => boolean
    onFinishHydration: (fn: () => void) => () => void
  }
}

export type TheoryStoreHook = UseBoundStore<StoreApi<TheoryStore>> & Partial<TheoryPersist>

const createInitializer =
  (): StateCreator<TheoryStore> => (set, get) => ({
    ...DEFAULT_THEORY_UI,

    setKey: (key, spelling) =>
      set({
        key,
        keySpelling: resolveSpelling(key, spelling),
      }),

    setMode: (mode) => set({ mode }),

    setMinorForm: (minorForm) => set({ minorForm }),

    setFocusDegree: (focusDegree) => set({ focusDegree }),

    toggleFocusDegree: (degree) => {
      const current = get().focusDegree
      set({ focusDegree: current === degree ? null : degree })
    },

    setNeckLabelMode: (neckLabelMode) => set({ neckLabelMode }),

    toggleNeckLabelMode: () => {
      const cur = get().neckLabelMode
      set({ neckLabelMode: cur === 'notes' ? 'degrees' : 'notes' })
    },

    pickIntervalNote: (pick) => {
      const { intervalA, intervalB } = get()
      if (!intervalA) {
        set({ intervalA: pick, intervalB: null })
        return
      }
      if (!intervalB) {
        set({ intervalB: pick })
        return
      }
      // Third click: keep A, replace B (compare a fixed root to new targets).
      set({ intervalB: pick })
    },

    clearIntervalPicks: () => set({ intervalA: null, intervalB: null }),

    selectKey: ({ key, keySpelling, mode, minorForm }) => {
      const prev = get()
      const nextSpelling = resolveSpelling(key, keySpelling)
      const nextMinor =
        minorForm ?? (mode === 'minor' ? prev.minorForm : 'natural')
      // Clear degree focus when key/mode jumps (CoF / analyzer) so chord-tone
      // filter never outlives the key it was chosen under.
      const keyChanged =
        prev.key !== key || prev.mode !== mode || prev.keySpelling !== nextSpelling
      // When the tonic moves, seed the interval lesson with previous → new key.
      const intervalUpdate =
        keyChanged && prev.key !== key
          ? {
              intervalA: { pc: prev.key, spelling: prev.keySpelling },
              intervalB: { pc: key, spelling: nextSpelling },
            }
          : {}
      set({
        key,
        keySpelling: nextSpelling,
        mode,
        minorForm: nextMinor,
        focusDegree: keyChanged ? null : prev.focusDegree,
        ...intervalUpdate,
      })
    },

    resetTheoryUi: () => set({ ...DEFAULT_THEORY_UI }),
  })

export function createTheoryStore(
  options: CreateTheoryStoreOptions = {},
): TheoryStoreHook {
  const usePersist = options.persist !== false
  const initializer = createInitializer()

  if (!usePersist) {
    return create<TheoryStore>()(initializer)
  }

  const baseStorage: StateStorage =
    options.storage ??
    ({
      getItem: (name) => localStorage.getItem(name),
      setItem: (name, value) => {
        localStorage.setItem(name, value)
      },
      removeItem: (name) => {
        localStorage.removeItem(name)
      },
    } satisfies StateStorage)

  type PersistedTheoryUi = Pick<
    TheoryUiState,
    'key' | 'keySpelling' | 'mode' | 'minorForm' | 'focusDegree' | 'neckLabelMode'
  >

  const persistOptions: PersistOptions<TheoryStore, PersistedTheoryUi> = {
    name: THEORY_STORAGE_KEY,
    storage: createJSONStorage(() => baseStorage),
    partialize: (state) => ({
      key: state.key,
      keySpelling: state.keySpelling,
      mode: state.mode,
      minorForm: state.minorForm,
      focusDegree: state.focusDegree,
      neckLabelMode: state.neckLabelMode,
      // interval picks are session-only — not persisted
    }),
  }

  return create<TheoryStore>()(persist(initializer, persistOptions))
}

/** App singleton — theory UI state with localStorage rehydrate. */
export const useTheoryStore = createTheoryStore()

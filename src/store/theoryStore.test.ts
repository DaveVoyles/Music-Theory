import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_THEORY_UI,
  THEORY_STORAGE_KEY,
  createTheoryStore,
  toKeyRef,
  type TheoryStore,
} from './theoryStore'
import type { StateStorage } from 'zustand/middleware'

function memoryStorage(): StateStorage & { dump: () => Map<string, string> } {
  const map = new Map<string, string>()
  return {
    getItem: (name) => map.get(name) ?? null,
    setItem: (name, value) => {
      map.set(name, value)
    },
    removeItem: (name) => {
      map.delete(name)
    },
    dump: () => map,
  }
}

function waitForPersist(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('theory store defaults', () => {
  it('cold starts at C major, natural minor form, no degree filter', () => {
    const store = createTheoryStore({ persist: false })
    const s = store.getState()
    expect(s.key).toBe(0)
    expect(s.keySpelling).toBe('C')
    expect(s.mode).toBe('major')
    expect(s.minorForm).toBe('natural')
    expect(s.focusDegree).toBeNull()
    expect(s).toMatchObject(DEFAULT_THEORY_UI)
  })

  it('exposes key, mode, minorForm, focusDegree fields', () => {
    const store = createTheoryStore({ persist: false })
    const s = store.getState()
    for (const field of ['key', 'mode', 'minorForm', 'focusDegree'] as const) {
      expect(s).toHaveProperty(field)
    }
  })
})

describe('theory store setters', () => {
  let store: { getState: () => TheoryStore }

  beforeEach(() => {
    store = createTheoryStore({ persist: false })
  })

  it('setKey updates pitch class and spelling', () => {
    store.getState().setKey(7, 'G')
    expect(store.getState().key).toBe(7)
    expect(store.getState().keySpelling).toBe('G')
  })

  it('setMode / setMinorForm / setFocusDegree update fields', () => {
    store.getState().setMode('minor')
    store.getState().setMinorForm('harmonic')
    store.getState().setFocusDegree(5)
    expect(store.getState().mode).toBe('minor')
    expect(store.getState().minorForm).toBe('harmonic')
    expect(store.getState().focusDegree).toBe(5)
  })

  it('toggleFocusDegree clears when the same degree is selected again', () => {
    store.getState().toggleFocusDegree(2)
    expect(store.getState().focusDegree).toBe(2)
    store.getState().toggleFocusDegree(2)
    expect(store.getState().focusDegree).toBeNull()
  })

  it('selectKey applies CoF / analyzer jumps', () => {
    store.getState().selectKey({
      key: 9,
      keySpelling: 'A',
      mode: 'minor',
      minorForm: 'melodic',
    })
    const s = store.getState()
    expect(s.key).toBe(9)
    expect(s.mode).toBe('minor')
    expect(s.minorForm).toBe('melodic')
    expect(toKeyRef(s)).toEqual({
      tonic: 9,
      tonicSpelling: 'A',
      mode: 'minor',
      minorForm: 'melodic',
    })
  })

  it('selectKey clears focusDegree so filters never orphan under a new key', () => {
    store.getState().setFocusDegree(5)
    store.getState().selectKey({ key: 7, keySpelling: 'G', mode: 'major' })
    expect(store.getState().focusDegree).toBeNull()
    expect(store.getState().key).toBe(7)
  })

  it('resetTheoryUi restores cold-start defaults', () => {
    store.getState().selectKey({ key: 5, keySpelling: 'F', mode: 'major' })
    store.getState().setFocusDegree(4)
    store.getState().resetTheoryUi()
    expect(store.getState()).toMatchObject(DEFAULT_THEORY_UI)
  })
})

describe('localStorage rehydrate', () => {
  it('persists theory UI and restores on a new store instance', async () => {
    const storage = memoryStorage()
    const first = createTheoryStore({ storage })
    first.getState().selectKey({
      key: 7,
      keySpelling: 'G',
      mode: 'major',
    })
    first.getState().setFocusDegree(1)
    await waitForPersist()

    const raw = storage.getItem(THEORY_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(raw).toContain('"key":7')

    const second = createTheoryStore({ storage })
    // zustand persist rehydrates async from storage
    await waitForPersist()
    await new Promise<void>((resolve) => {
      const api = second.persist
      if (!api) {
        resolve()
        return
      }
      const unsub = api.onFinishHydration(() => {
        unsub()
        resolve()
      })
      if (api.hasHydrated()) {
        unsub()
        resolve()
      }
    })

    const s = second.getState()
    expect(s.key).toBe(7)
    expect(s.keySpelling).toBe('G')
    expect(s.mode).toBe('major')
    expect(s.focusDegree).toBe(1)
  })

  it('does not persist action functions into the snapshot shape', async () => {
    const storage = memoryStorage()
    const store = createTheoryStore({ storage })
    store.getState().setMode('minor')
    await waitForPersist()
    const raw = await Promise.resolve(storage.getItem(THEORY_STORAGE_KEY))
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw as string) as { state: Record<string, unknown> }
    expect(parsed.state.setKey).toBeUndefined()
    expect(parsed.state.key).toBe(0)
    expect(parsed.state.mode).toBe('minor')
  })
})

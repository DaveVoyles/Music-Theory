import { describe, expect, it, vi } from 'vitest'
import { HttpProvider } from './HttpProvider'
import { MockProvider } from './MockProvider'
import { FIXTURE_SONGS } from './fixtures'

describe('MockProvider', () => {
  const provider = new MockProvider()

  it('lists 3 fixture songs and filters by query', async () => {
    const all = await provider.search('')
    expect(all).toHaveLength(3)
    const hits = await provider.search('creep')
    expect(hits).toHaveLength(1)
    expect(hits[0]!.title).toBe('Creep')
  })

  it('returns section timeline DTO', async () => {
    const analysis = await provider.getAnalysis(FIXTURE_SONGS[0]!.id)
    expect(analysis.title).toBe('Hotel California')
    expect(analysis.sections.length).toBeGreaterThanOrEqual(2)
    expect(analysis.sections[0]).toMatchObject({
      chords: expect.any(Array),
      romans: expect.any(Array),
      borrowed: expect.any(Boolean),
      key: expect.objectContaining({ spelling: expect.any(String), mode: expect.any(String) }),
    })
  })
})

describe('HttpProvider', () => {
  it('builds search/analysis URLs from base URL without secrets', () => {
    const p = new HttpProvider({ baseUrl: 'http://127.0.0.1:9999/' })
    expect(p.buildSearchUrl('hotel')).toBe(
      'http://127.0.0.1:9999/analyze/search?q=hotel',
    )
    expect(p.buildAnalysisUrl('abc')).toBe(
      'http://127.0.0.1:9999/analyze/abc',
    )
  })

  it('calls fetch with constructed URLs', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (String(url).includes('/search')) {
        return {
          ok: true,
          json: async () => [{ id: 'x', title: 'X', primaryKeyLabel: 'C major' }],
        }
      }
      return {
        ok: true,
        json: async () => FIXTURE_SONGS[1],
      }
    }) as unknown as typeof fetch

    const p = new HttpProvider({
      baseUrl: 'http://gateway.local',
      fetchImpl,
    })
    const results = await p.search('creep')
    expect(results[0]!.title).toBe('X')
    expect(fetchImpl).toHaveBeenCalled()
    const analysis = await p.getAnalysis('fixture-creep')
    expect(analysis.title).toBe('Creep')
  })

  it('rejects empty base URL', () => {
    expect(() => new HttpProvider({ baseUrl: '  ' })).toThrow(/baseUrl/)
  })
})

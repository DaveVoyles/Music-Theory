import { FIXTURE_SONGS } from './fixtures'
import type {
  SongAnalysis,
  SongAnalysisSummary,
  SongAnalyzerProvider,
} from './types'

function toSummary(song: SongAnalysis): SongAnalysisSummary {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    primaryKeyLabel: `${song.primaryKey.spelling} ${song.primaryKey.mode}`,
  }
}

/** Offline fixture provider — 2–3 songs, no network. */
export class MockProvider implements SongAnalyzerProvider {
  async search(query: string): Promise<SongAnalysisSummary[]> {
    const q = query.trim().toLowerCase()
    const list = FIXTURE_SONGS.map(toSummary)
    if (!q) return list
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.artist?.toLowerCase().includes(q) ?? false),
    )
  }

  async getAnalysis(id: string): Promise<SongAnalysis> {
    const song = FIXTURE_SONGS.find((s) => s.id === id)
    if (!song) throw new Error(`Unknown fixture song: ${id}`)
    return structuredClone(song)
  }
}

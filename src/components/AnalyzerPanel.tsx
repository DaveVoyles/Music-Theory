import { useEffect, useMemo, useState } from 'react'
import { MockProvider, type SongAnalysis, type SongAnalysisSummary } from '../analyzer'
import { useTheoryStore } from '../store'

const provider = new MockProvider()

/**
 * Collapsible analyzer body: search fixture songs, show section timeline,
 * section click jumps theory store key/mode.
 */
export function AnalyzerPanel() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SongAnalysisSummary[]>([])
  const [analysis, setAnalysis] = useState<SongAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const selectKey = useTheoryStore((s) => s.selectKey)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const list = await provider.search(query)
        if (!cancelled) setResults(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Search failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [query])

  const emptyCopy = useMemo(() => {
    if (loading) return 'Searching fixtures…'
    if (error) return error
    if (!analysis && results.length === 0) return 'No fixture songs match.'
    if (!analysis) return 'Select a song to load its section timeline.'
    return null
  }, [loading, error, analysis, results.length])

  async function loadSong(id: string) {
    setLoading(true)
    setError(null)
    try {
      const full = await provider.getAnalysis(id)
      setAnalysis(full)
      selectKey({
        key: full.primaryKey.pc,
        keySpelling: full.primaryKey.spelling,
        mode: full.primaryKey.mode,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  function applySection(sectionId: string) {
    if (!analysis) return
    const section = analysis.sections.find((s) => s.id === sectionId)
    if (!section) return
    selectKey({
      key: section.key.pc,
      keySpelling: section.key.spelling,
      mode: section.key.mode,
    })
  }

  return (
    <div className="analyzer-panel">
      <div className="analyzer-search">
        <label className="analyzer-label" htmlFor="analyzer-query">
          Song search
        </label>
        <input
          id="analyzer-query"
          className="analyzer-input"
          type="search"
          placeholder="Search fixture songs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="analyzer-columns">
        <ul className="analyzer-results" aria-label="Fixture songs">
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`analyzer-song-btn ${analysis?.id === s.id ? 'is-active' : ''}`}
                onClick={() => void loadSong(s.id)}
              >
                <span className="analyzer-song-title">{s.title}</span>
                <span className="analyzer-song-meta">
                  {s.artist ? `${s.artist} · ` : ''}
                  {s.primaryKeyLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="analyzer-timeline" aria-label="Section timeline">
          {emptyCopy ? (
            <p className="empty-copy muted">{emptyCopy}</p>
          ) : (
            <>
              <h3 className="analyzer-timeline-title">
                {analysis!.title}
                {analysis!.artist ? (
                  <span className="analyzer-song-meta"> · {analysis!.artist}</span>
                ) : null}
              </h3>
              <ol className="analyzer-sections">
                {analysis!.sections.map((sec) => (
                  <li key={sec.id}>
                    <button
                      type="button"
                      className="analyzer-section-btn"
                      onClick={() => applySection(sec.id)}
                    >
                      <span className="analyzer-section-name">
                        {sec.startLabel ? `${sec.startLabel} · ` : ''}
                        {sec.name}
                        {sec.borrowed ? ' · borrowed' : ''}
                      </span>
                      <span className="analyzer-section-key">
                        {sec.key.spelling} {sec.key.mode}
                      </span>
                      <span className="analyzer-section-chords">
                        {sec.chords.join(' · ')}
                      </span>
                      <span className="analyzer-section-romans">
                        {sec.romans.join(' ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnalyzerPanel

import { useState } from 'react'
import './App.css'

/**
 * Desktop-first shell: CoF left, fretboard bottom/right, analyzer collapsible.
 * Panes are empty placeholders until D4–D8 land.
 */
function App() {
  const [analyzerOpen, setAnalyzerOpen] = useState(true)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Music Theory</h1>
        <p className="app-subtitle">Circle of Fifths · Fretboard · Analyzer</p>
      </header>

      <div className="workspace">
        <aside className="panel panel-cof" aria-label="Circle of Fifths">
          <div className="panel-header">
            <h2>Circle of Fifths</h2>
          </div>
          <div className="panel-body empty-pane">
            <p className="empty-copy">Dual-ring CoF will render here (Pixi).</p>
          </div>
          <div className="panel-footer empty-pane roman-slot">
            <p className="empty-copy muted">Roman strip · minor form (coming soon)</p>
          </div>
        </aside>

        <main className="panel panel-fretboard" aria-label="Fretboard">
          <div className="panel-header">
            <h2>Fretboard</h2>
            <span className="panel-meta">EADGBE · frets 0–12</span>
          </div>
          <div className="panel-body empty-pane">
            <p className="empty-copy">Guitar neck map will render here (Pixi).</p>
          </div>
        </main>
      </div>

      <section
        className={`panel panel-analyzer ${analyzerOpen ? 'is-open' : 'is-collapsed'}`}
        aria-label="Song analyzer"
      >
        <div className="panel-header analyzer-header">
          <h2>Analyzer</h2>
          <button
            type="button"
            className="collapse-btn"
            aria-expanded={analyzerOpen}
            onClick={() => setAnalyzerOpen((open) => !open)}
          >
            {analyzerOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>
        {analyzerOpen ? (
          <div className="panel-body empty-pane">
            <p className="empty-copy">
              Mock song analysis panel will live here (SongAnalyzerProvider).
            </p>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default App

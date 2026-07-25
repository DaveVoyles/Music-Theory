import { useState } from 'react'
import './App.css'
import { AnalyzerPanel } from './components/AnalyzerPanel'
import { CircleOfFifths } from './components/CircleOfFifths'
import { Fretboard } from './components/Fretboard'
import { MinorFormControl } from './components/MinorFormControl'
import { RomanStrip } from './components/RomanStrip'
import { useTheoryStore } from './store'

/**
 * Desktop-first shell: CoF left, fretboard bottom/right, analyzer collapsible.
 */
function App() {
  const [analyzerOpen, setAnalyzerOpen] = useState(true)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Music Theory</h1>
        <p className="app-subtitle">Circle of Fifths · Fretboard · Analyzer</p>
        <p className="app-key-badge" aria-live="polite">
          {keySpelling} {mode}
        </p>
      </header>

      <div className="workspace">
        <aside className="panel panel-cof" aria-label="Circle of Fifths">
          <div className="panel-header">
            <h2>Circle of Fifths</h2>
          </div>
          <div className="panel-body cof-pane">
            <CircleOfFifths />
          </div>
          <div className="panel-footer roman-slot">
            <MinorFormControl />
            <RomanStrip />
          </div>
        </aside>

        <main className="panel panel-fretboard" aria-label="Fretboard">
          <div className="panel-header">
            <h2>Fretboard</h2>
            <span className="panel-meta">EADGBE · frets 0–12</span>
          </div>
          <div className="panel-body fretboard-pane">
            <Fretboard />
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
          <div className="panel-body analyzer-body">
            <AnalyzerPanel />
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import { AnalyzerPanel } from './components/AnalyzerPanel'
import { CircleOfFifths } from './components/CircleOfFifths'
import { FeatureHeading, HelpTip } from './components/HelpTip'
import { Fretboard } from './components/Fretboard'
import { DegreeLesson } from './components/DegreeLesson'
import { KeyLesson } from './components/KeyLesson'
import { MinorFormControl } from './components/MinorFormControl'
import { RomanStrip } from './components/RomanStrip'
import { useTheoryStore } from './store'

/**
 * Desktop-first shell: CoF left, fretboard bottom/right, analyzer collapsible.
 * Each major region exposes hover/focus help via HelpTip / FeatureHeading.
 */
function App() {
  const [analyzerOpen, setAnalyzerOpen] = useState(true)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const focusDegree = useTheoryStore((s) => s.focusDegree)

  const keyLabel =
    mode === 'minor'
      ? `${keySpelling} ${mode} (${minorForm})`
      : `${keySpelling} ${mode}`
  const focusLabel =
    focusDegree === null ? 'all diatonic' : `degree ${focusDegree} focus`

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-text">
          <h1 className="app-title">
            Music Theory
            <HelpTip feature="app" />
          </h1>
          <p className="app-subtitle">
            Hover the <span className="help-inline-hint">?</span> icons for what each
            feature does · click the circle or a song section to set the key · click
            frets to hear notes
          </p>
        </div>
        <div className="app-key-badge-wrap">
          <p className="app-key-badge" aria-live="polite">
            {keyLabel}
            <span className="app-key-badge-sub">{focusLabel}</span>
          </p>
          <HelpTip feature="keyBadge" compact />
        </div>
      </header>

      <div className="workspace">
        <aside className="panel panel-cof" aria-label="Circle of Fifths">
          <div className="panel-header">
            <FeatureHeading
              feature="circleOfFifths"
              meta="Outer major · inner minor"
            />
          </div>
          <div className="panel-body cof-pane">
            <CircleOfFifths />
          </div>
          <KeyLesson />
          <div className="panel-footer roman-slot">
            <p className="control-hint">
              {mode === 'minor'
                ? 'Minor form changes scale degrees 6/7 on the neck.'
                : 'Select a degree to spotlight chord tones on the neck.'}
            </p>
            {mode === 'minor' ? (
              <div className="control-row">
                <span className="control-row-label">
                  Minor form
                  <HelpTip feature="minorForm" compact />
                </span>
                <MinorFormControl />
              </div>
            ) : null}
            <div className="control-row">
              <span className="control-row-label">
                Degrees
                <HelpTip feature="romanStrip" compact />
              </span>
              <RomanStrip />
            </div>
            <DegreeLesson />
          </div>
        </aside>

        <main className="panel panel-fretboard" aria-label="Fretboard">
          <div className="panel-header">
            <FeatureHeading
              feature="fretboard"
              meta="EADGBE · frets 0–12 · Low E/A/D emphasized"
            />
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
          <div>
            <FeatureHeading
              feature="analyzer"
              meta="Fixture songs in v1 — section click jumps the workspace key"
            />
          </div>
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
        ) : (
          <p className="analyzer-collapsed-copy">
            Analyzer collapsed — expand to search fixture songs and jump keys by section.
          </p>
        )}
      </section>
    </div>
  )
}

export default App

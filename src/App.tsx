import { useState } from 'react'
import './App.css'
import { AnalyzerPanel } from './components/AnalyzerPanel'
import { CircleOfFifths } from './components/CircleOfFifths'
import { FeatureHeading, HelpTip } from './components/HelpTip'
import { Fretboard } from './components/Fretboard'
import { DegreeLesson } from './components/DegreeLesson'
import { IntervalLesson } from './components/IntervalLesson'
import { KeyLesson } from './components/KeyLesson'
import { MinorFormControl } from './components/MinorFormControl'
import { ProgressionPanel } from './components/ProgressionPanel'
import { QuizPanel } from './components/QuizPanel'
import { RomanStrip } from './components/RomanStrip'
import { useTheoryStore } from './store'

/**
 * Desktop-first shell: CoF left, fretboard bottom/right, analyzer collapsible.
 * Each major region exposes hover/focus help via HelpTip / FeatureHeading.
 */
function App() {
  // Collapsed by default so the fretboard owns the viewport.
  const [analyzerOpen, setAnalyzerOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
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
            feature does · click the circle or frets for keys &amp; intervals · quiz
            includes ear training
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
            <ProgressionPanel />
          </div>
        </aside>

        <main className="panel panel-fretboard" aria-label="Fretboard">
          <div className="panel-header">
            <FeatureHeading
              feature="fretboard"
              meta="Gold = root · green = in key · dark = outside"
            />
          </div>
          <div className="panel-body fretboard-pane">
            <Fretboard />
            <IntervalLesson />
          </div>
          <section
            className={`panel-quiz ${quizOpen ? 'is-open' : 'is-collapsed'}`}
            aria-label="Theory quiz"
          >
            <div className="panel-header quiz-panel-header">
              <FeatureHeading
                feature="quiz"
                meta="Signatures · degrees · ear training"
              />
              <button
                type="button"
                className="collapse-btn"
                aria-expanded={quizOpen}
                onClick={() => setQuizOpen((o) => !o)}
              >
                {quizOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {quizOpen ? (
              <div className="panel-body quiz-body">
                <QuizPanel />
              </div>
            ) : (
              <p className="quiz-collapsed-copy">
                Quiz collapsed — expand to drill sharps/flats and degree functions.
              </p>
            )}
          </section>
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

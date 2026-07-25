import { HelpTip } from './HelpTip'
import { theoryAudio } from '../audio'
import { intervalInfo } from '../theory'
import { useTheoryStore } from '../store'

/**
 * Live interval lesson: last two frets (or previous → current CoF key).
 */
export function IntervalLesson() {
  const intervalA = useTheoryStore((s) => s.intervalA)
  const intervalB = useTheoryStore((s) => s.intervalB)
  const clearIntervalPicks = useTheoryStore((s) => s.clearIntervalPicks)

  if (!intervalA) {
    return (
      <section
        className="interval-lesson interval-lesson--idle"
        aria-label="Interval lesson"
        aria-live="polite"
      >
        <header className="interval-lesson-header">
          <h2 className="interval-lesson-title">
            Interval
            <HelpTip feature="intervalLesson" compact />
          </h2>
          <p className="interval-lesson-summary">
            Click two frets on the neck (or two keys on the Circle) to name the
            interval and hear it.
          </p>
        </header>
      </section>
    )
  }

  if (!intervalB) {
    return (
      <section
        className="interval-lesson interval-lesson--partial"
        aria-label="Interval lesson"
        aria-live="polite"
      >
        <header className="interval-lesson-header">
          <h2 className="interval-lesson-title">
            Interval
            <HelpTip feature="intervalLesson" compact />
          </h2>
          <p className="interval-lesson-summary">
            First note: <strong>{intervalA.spelling}</strong> — click a second
            note to measure the interval.
          </p>
        </header>
        <div className="interval-lesson-actions">
          <button
            type="button"
            className="interval-lesson-btn"
            onClick={() => void theoryAudio.playPitch(intervalA.pc)}
          >
            Hear note
          </button>
          <button
            type="button"
            className="interval-lesson-btn interval-lesson-btn--ghost"
            onClick={() => clearIntervalPicks()}
          >
            Clear
          </button>
        </div>
      </section>
    )
  }

  const info = intervalInfo(intervalA, intervalB)

  return (
    <section
      className="interval-lesson"
      aria-label="Interval lesson"
      aria-live="polite"
    >
      <header className="interval-lesson-header">
        <h2 className="interval-lesson-title">
          Interval
          <HelpTip feature="intervalLesson" compact />
        </h2>
        <p className="interval-lesson-summary">{info.summary}</p>
      </header>

      <div className="interval-lesson-meta">
        <span className="interval-lesson-badge">{info.short}</span>
        <span className="interval-lesson-name">{info.name}</span>
        <span className="interval-lesson-semi">
          {info.semitones} semitone{info.semitones === 1 ? '' : 's'}
        </span>
      </div>

      <div className="interval-lesson-tones-row">
        <div className="interval-lesson-tones" aria-label="Interval notes">
          <span className="interval-lesson-tone">{intervalA.spelling}</span>
          <span className="interval-lesson-arrow" aria-hidden>
            →
          </span>
          <span className="interval-lesson-tone">{intervalB.spelling}</span>
        </div>
        <button
          type="button"
          className="interval-lesson-btn"
          onClick={() =>
            void theoryAudio.playInterval(intervalA.pc, intervalB.pc)
          }
        >
          Hear interval
        </button>
        <button
          type="button"
          className="interval-lesson-btn interval-lesson-btn--ghost"
          onClick={() => clearIntervalPicks()}
        >
          Clear
        </button>
      </div>

      <dl className="interval-lesson-facts">
        <div>
          <dt>Why</dt>
          <dd>{info.why}</dd>
        </div>
        <div>
          <dt>Try this</dt>
          <dd>{info.tryThis}</dd>
        </div>
      </dl>
    </section>
  )
}

export default IntervalLesson

import { HelpTip } from './HelpTip'
import { theoryAudio } from '../audio'
import {
  degreeLessonInfo,
  degreeLessonOverview,
  type HarmonicFunction,
} from '../theory'
import { useTheoryStore } from '../store'

const FAMILY_CLASS: Record<HarmonicFunction, string> = {
  tonic: 'degree-lesson--tonic',
  subdominant: 'degree-lesson--subdominant',
  dominant: 'degree-lesson--dominant',
  mediant: 'degree-lesson--mediant',
  leading: 'degree-lesson--dominant',
}

/**
 * Live lesson for the focused scale degree (roman strip).
 * When no degree is selected, shows a short function-family overview.
 */
export function DegreeLesson() {
  const key = useTheoryStore((s) => s.key)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const focusDegree = useTheoryStore((s) => s.focusDegree)

  const keyRef = {
    tonic: key,
    mode,
    tonicSpelling: keySpelling,
    minorForm,
  }

  if (focusDegree === null) {
    return (
      <section
        className="degree-lesson degree-lesson--idle"
        aria-label="Degree lesson"
        aria-live="polite"
      >
        <header className="degree-lesson-header">
          <h2 className="degree-lesson-title">
            Degree function
            <HelpTip feature="degreeLesson" compact />
          </h2>
          <p className="degree-lesson-summary">{degreeLessonOverview(keyRef)}</p>
        </header>
      </section>
    )
  }

  const info = degreeLessonInfo(keyRef, focusDegree)
  const familyClass = FAMILY_CLASS[info.functionFamily]

  return (
    <section
      className={`degree-lesson ${familyClass}`}
      aria-label="Degree lesson"
      aria-live="polite"
    >
      <header className="degree-lesson-header">
        <h2 className="degree-lesson-title">
          Degree function
          <HelpTip feature="degreeLesson" compact />
        </h2>
        <p className="degree-lesson-summary">{info.summary}</p>
      </header>

      <div className="degree-lesson-meta">
        <span className="degree-lesson-badge">{info.roman}</span>
        <span className="degree-lesson-name">{info.degreeName}</span>
        <span className="degree-lesson-quality">{info.quality}</span>
      </div>

      <div className="degree-lesson-tones-row">
        <div className="degree-lesson-tones" aria-label="Chord tones">
          {info.chordTones.map((tone, i) => (
            <span key={`${tone}-${i}`} className="degree-lesson-tone">
              {tone}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="degree-lesson-hear"
          onClick={() => void theoryAudio.playDegreeTriad(keyRef, focusDegree)}
        >
          Hear triad
        </button>
      </div>

      <dl className="degree-lesson-facts">
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

export default DegreeLesson

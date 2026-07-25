import { HelpTip } from './HelpTip'
import { StaffSignature } from './StaffSignature'
import { keySignatureInfo } from '../theory'
import { useTheoryStore } from '../store'

/**
 * Live lesson for the current key: accidental count, which notes, why,
 * and how to remember — updates whenever the workspace key changes.
 */
export function KeyLesson() {
  const key = useTheoryStore((s) => s.key)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)

  const info = keySignatureInfo({
    tonic: key,
    mode,
    tonicSpelling: keySpelling,
  })

  const accidentalClass =
    info.kind === 'sharp'
      ? 'key-lesson-pills--sharp'
      : info.kind === 'flat'
        ? 'key-lesson-pills--flat'
        : 'key-lesson-pills--natural'

  return (
    <section className="key-lesson" aria-label="Key signature lesson" aria-live="polite">
      <header className="key-lesson-header">
        <h2 className="key-lesson-title">
          Key signature
          <HelpTip feature="keyLesson" compact />
        </h2>
        <p className="key-lesson-summary">{info.summary}</p>
      </header>

      <div className="key-lesson-sig-row">
        <StaffSignature
          kind={info.kind}
          accidentals={info.accidentals}
          label={`${info.keyLabel} key signature on treble staff`}
        />
        <div className={`key-lesson-pills ${accidentalClass}`}>
          {info.count === 0 ? (
            <span className="key-lesson-pill key-lesson-pill--empty">♮ natural</span>
          ) : (
            info.accidentals.map((acc) => (
              <span key={acc} className="key-lesson-pill">
                {acc}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="key-lesson-scale" aria-label="Scale notes">
        {info.scaleNotes.map((note) => {
          const highlight = info.accidentals.includes(note)
          return (
            <span
              key={note}
              className={`key-lesson-note${highlight ? ' is-accidental' : ''}`}
            >
              {note}
            </span>
          )
        })}
      </div>

      <dl className="key-lesson-facts">
        <div>
          <dt>Why</dt>
          <dd>{info.why}</dd>
        </div>
        <div>
          <dt>Remember</dt>
          <dd>{info.howToRemember}</dd>
        </div>
        <div className="key-lesson-pair">
          <dt>Relative pair</dt>
          <dd>
            {info.relativeMajor} major · {info.relativeMinor} minor
            <span className="key-lesson-pair-hint"> same signature</span>
          </dd>
        </div>
      </dl>
    </section>
  )
}

export default KeyLesson

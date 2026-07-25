import { theoryAudio } from '../audio'
import { ALL_DEGREES, romanNumeral, type Degree } from '../theory'
import { useTheoryStore } from '../store'

/**
 * Compact I–vii° strip under the CoF. Selecting a degree focuses chord tones,
 * teaches via DegreeLesson, and plays the degree triad (ear training).
 * Re-selecting the same degree or All clears the filter.
 */
export function RomanStrip() {
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const key = useTheoryStore((s) => s.key)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const focusDegree = useTheoryStore((s) => s.focusDegree)
  const toggleFocusDegree = useTheoryStore((s) => s.toggleFocusDegree)
  const setFocusDegree = useTheoryStore((s) => s.setFocusDegree)

  const keyRef = {
    tonic: key,
    tonicSpelling: keySpelling,
    mode,
    minorForm,
  }

  function onDegreeClick(deg: Degree) {
    const clearing = focusDegree === deg
    toggleFocusDegree(deg)
    if (!clearing) {
      void theoryAudio.playDegreeTriad(keyRef, deg)
    }
  }

  return (
    <div className="roman-strip" role="toolbar" aria-label="Degree focus">
      <button
        type="button"
        className={`roman-btn ${focusDegree === null ? 'is-active' : ''}`}
        onClick={() => setFocusDegree(null)}
      >
        All
      </button>
      {ALL_DEGREES.map((deg: Degree) => (
        <button
          key={deg}
          type="button"
          className={`roman-btn ${focusDegree === deg ? 'is-active' : ''}`}
          aria-pressed={focusDegree === deg}
          onClick={() => onDegreeClick(deg)}
        >
          {romanNumeral(keyRef, deg)}
        </button>
      ))}
    </div>
  )
}

export default RomanStrip

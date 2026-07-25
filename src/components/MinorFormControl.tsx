import type { MinorForm } from '../theory'
import { useTheoryStore } from '../store'

const FORMS: { id: MinorForm; label: string }[] = [
  { id: 'natural', label: 'Natural' },
  { id: 'harmonic', label: 'Harmonic' },
  { id: 'melodic', label: 'Melodic' },
]

/**
 * Segmented natural / harmonic / melodic control — only when mode is minor.
 */
export function MinorFormControl() {
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const setMinorForm = useTheoryStore((s) => s.setMinorForm)

  if (mode !== 'minor') return null

  return (
    <div
      className="minor-form-control"
      role="radiogroup"
      aria-label="Minor form"
    >
      {FORMS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="radio"
          aria-checked={minorForm === f.id}
          className={`minor-form-btn ${minorForm === f.id ? 'is-active' : ''}`}
          onClick={() => setMinorForm(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default MinorFormControl

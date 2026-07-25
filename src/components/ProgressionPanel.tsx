import { useEffect, useRef, useState } from 'react'
import { HelpTip } from './HelpTip'
import { theoryAudio } from '../audio'
import { progressionsForMode, romanNumeral, type Degree } from '../theory'
import { toKeyRef, useTheoryStore } from '../store'

/**
 * Play common diatonic progressions; focuses each degree on the neck in turn.
 */
export function ProgressionPanel() {
  const mode = useTheoryStore((s) => s.mode)
  const setFocusDegree = useTheoryStore((s) => s.setFocusDegree)
  const presets = progressionsForMode(mode)
  const [presetId, setPresetId] = useState(presets[0]?.id ?? '')
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState<number | null>(null)
  const timersRef = useRef<number[]>([])

  // Reset selection when mode changes and current preset disappears.
  useEffect(() => {
    if (!presets.some((p) => p.id === presetId)) {
      setPresetId(presets[0]?.id ?? '')
    }
  }, [mode, presets, presetId])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const preset = presets.find((p) => p.id === presetId) ?? presets[0]
  if (!preset) return null

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  async function play() {
    if (!preset || playing) return
    clearTimers()
    setPlaying(true)
    const state = useTheoryStore.getState()
    const keyRef = toKeyRef(state)
    const degrees = preset.degrees
    const gapMs = 600

    // Fire audio progression once; sync focus UI with timeouts.
    void theoryAudio.playProgression(keyRef, degrees, gapMs / 1000)

    degrees.forEach((degree, i) => {
      const id = window.setTimeout(() => {
        setStep(i)
        setFocusDegree(degree as Degree)
      }, i * gapMs)
      timersRef.current.push(id)
    })

    const doneId = window.setTimeout(() => {
      setPlaying(false)
      setStep(null)
      // Leave last degree focused so the neck matches the cadence chord.
    }, degrees.length * gapMs)
    timersRef.current.push(doneId)
  }

  function stop() {
    clearTimers()
    setPlaying(false)
    setStep(null)
  }

  const state = useTheoryStore.getState()
  const keyRef = toKeyRef(state)
  const romans = preset.degrees.map((d) => romanNumeral(keyRef, d))

  return (
    <section className="progression-panel" aria-label="Progression player">
      <header className="progression-header">
        <h2 className="progression-title">
          Progression
          <HelpTip feature="progression" compact />
        </h2>
        <p className="progression-meta">{preset.tag}</p>
      </header>

      <div className="progression-presets" role="group" aria-label="Progression presets">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`progression-preset-btn${p.id === preset.id ? ' is-active' : ''}`}
            aria-pressed={p.id === preset.id}
            disabled={playing}
            onClick={() => setPresetId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="progression-romans" aria-live="polite">
        {romans.map((r, i) => (
          <span
            key={`${r}-${i}`}
            className={`progression-roman${step === i ? ' is-current' : ''}`}
          >
            {r}
          </span>
        ))}
      </div>

      <div className="progression-actions">
        <button
          type="button"
          className="progression-play"
          onClick={() => void play()}
          disabled={playing}
        >
          {playing ? 'Playing…' : 'Play progression'}
        </button>
        {playing ? (
          <button type="button" className="progression-stop" onClick={stop}>
            Stop
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default ProgressionPanel

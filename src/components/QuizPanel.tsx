import { useCallback, useEffect, useState } from 'react'
import { HelpTip } from './HelpTip'
import { theoryAudio } from '../audio'
import { nextQuizQuestion, type QuizQuestion } from '../theory'
import { parseSpelling, type Degree } from '../theory'
import { useTheoryStore } from '../store'

/**
 * Active recall drills: key signatures, degree functions, and ear training.
 * Optional “Show on workspace” jumps CoF/neck/lesson to the answer key.
 */
export function QuizPanel() {
  const selectKey = useTheoryStore((s) => s.selectKey)
  const setFocusDegree = useTheoryStore((s) => s.setFocusDegree)

  const [question, setQuestion] = useState<QuizQuestion>(() => nextQuizQuestion())
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })

  const answered = picked !== null
  const correct = answered && picked === question.correctIndex
  const isEar = question.kind === 'ear-degree' && question.hear

  const hearQuestion = useCallback(() => {
    const h = question.hear
    if (!h) return
    void theoryAudio.playDegreeTriad(h.key, h.degree)
  }, [question])

  // Auto-play ear questions when they appear (user gesture not required after first prime;
  // first click on Replay still primes if needed).
  useEffect(() => {
    if (question.kind === 'ear-degree' && question.hear) {
      // Slight delay so the new prompt paints before sound.
      const t = window.setTimeout(() => {
        void theoryAudio.playDegreeTriad(question.hear!.key, question.hear!.degree)
      }, 120)
      return () => window.clearTimeout(t)
    }
  }, [question])

  const next = useCallback(() => {
    setQuestion(nextQuizQuestion())
    setPicked(null)
  }, [])

  function onPick(index: number) {
    if (picked !== null) return
    setPicked(index)
    setScore((s) => ({
      right: s.right + (index === question.correctIndex ? 1 : 0),
      total: s.total + 1,
    }))
  }

  function explore() {
    const ex = question.explore
    if (!ex) return
    selectKey({
      key: parseSpelling(ex.keySpelling),
      keySpelling: ex.keySpelling,
      mode: ex.mode,
    })
    if (ex.degree !== undefined) {
      setFocusDegree(ex.degree as Degree)
    } else {
      setFocusDegree(null)
    }
  }

  return (
    <section className="quiz-panel" aria-label="Theory quiz">
      <header className="quiz-header">
        <h2 className="quiz-title">
          Quiz
          <HelpTip feature="quiz" compact />
        </h2>
        <p className="quiz-score" aria-live="polite">
          {score.total === 0
            ? 'Active recall'
            : `${score.right}/${score.total} correct`}
        </p>
      </header>

      <p className="quiz-prompt">{question.prompt}</p>

      {isEar ? (
        <div className="quiz-ear-row">
          <button type="button" className="quiz-primary" onClick={hearQuestion}>
            Replay triad
          </button>
          <span className="quiz-ear-hint">Listen, then choose the degree</span>
        </div>
      ) : null}

      <div className="quiz-choices" role="group" aria-label="Answer choices">
        {question.choices.map((choice, i) => {
          let cls = 'quiz-choice'
          if (answered) {
            if (i === question.correctIndex) cls += ' is-correct'
            else if (i === picked) cls += ' is-wrong'
            else cls += ' is-muted'
          }
          return (
            <button
              key={`${choice}-${i}`}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => onPick(i)}
            >
              {choice}
            </button>
          )
        })}
      </div>

      {answered ? (
        <div
          className={`quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`}
          role="status"
        >
          <p className="quiz-feedback-label">
            {correct ? 'Correct' : 'Not quite'}
          </p>
          <p className="quiz-explain">{question.explain}</p>
          <div className="quiz-actions">
            {question.explore ? (
              <button type="button" className="quiz-secondary" onClick={explore}>
                Show on workspace
              </button>
            ) : null}
            {isEar ? (
              <button type="button" className="quiz-secondary" onClick={hearQuestion}>
                Hear again
              </button>
            ) : null}
            <button type="button" className="quiz-primary" onClick={next}>
              Next question
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default QuizPanel

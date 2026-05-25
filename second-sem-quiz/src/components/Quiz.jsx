import { useState, useEffect, useRef } from 'react'
import { QUESTIONS } from '../data/questions.js'
import { useQuiz } from '../hooks/useQuiz.js'
import Timer from './Timer.jsx'
import QuestionCard from './QuestionCard.jsx'
import ReviewPanel from './ReviewPanel.jsx'
import './Quiz.css'

export default function Quiz({ subject, userName, onFinish, onExit, onToggleDark }) {
  const filtered = QUESTIONS[subject] || []
  const quiz = useQuiz(filtered)
  const [showPanel, setShowPanel] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const [localAnswer, setLocalAnswer] = useState(null)
  const confirmedIds = useRef(new Set())
  const [confirmedCount, setConfirmedCount] = useState(0)

  useEffect(() => {
    if (quiz.finished && quiz.results) {
      onFinish(quiz.results, subject)
    }
  }, [quiz.finished]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalAnswer(quiz.answers[quiz.current?.id] ?? null)
  }, [quiz.index]) // eslint-disable-line react-hooks/exhaustive-deps

  if (quiz.finished) return null
  const markedArr = Array.from(quiz.marked)

  function commitCurrent() {
    if (localAnswer !== null && quiz.current && !quiz.lockedQuestions.has(quiz.current.id)) {
      quiz.answer(localAnswer)
      if (!confirmedIds.current.has(quiz.current.id)) {
        confirmedIds.current.add(quiz.current.id)
        setConfirmedCount(confirmedIds.current.size)
      }
    }
  }
  function handleNext()   { commitCurrent(); quiz.goNext() }
  function handlePrev()   { commitCurrent(); quiz.goPrev() }
  function handleGoTo(i)  { commitCurrent(); quiz.goTo(i); setShowPanel(false) }
  function handleSubmit() { commitCurrent(); quiz.finishEarly() }


  return (
    <div className="quiz">
      {/* Top bar */}
      <header className="quiz-bar">
        <div className="quiz-bar__left">
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmExit(true)}>
            ← Exit
          </button>
          <span className={`tag tag-${subject.toLowerCase()}`}>{subject}</span>
        </div>

        <div className="quiz-bar__center">
          <span className="quiz-bar__progress">
            {quiz.index + 1} <span className="quiz-bar__sep">/</span> {quiz.total}
          </span>
        </div>

        <div className="quiz-bar__right">
          <button
            className={`btn btn-sm ${quiz.marked.has(quiz.current?.id) ? 'btn-amber' : 'btn-ghost'}`}
            onClick={quiz.toggleMark}
            title="Mark for review"
          >
            {quiz.marked.has(quiz.current?.id) ? '★ Marked' : '☆ Mark'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPanel(p => !p)}>
            Map {markedArr.length > 0 && <span className="quiz-bar__badge">{markedArr.length}</span>}
          </button>
          <button className="dark-toggle" onClick={onToggleDark} aria-label="Toggle dark mode" />
          <Timer timeLeft={quiz.timeLeft} />
        </div>
      </header>

      {/* Progress bar */}
      <div className="quiz-progress">
        <div
          className="quiz-progress__fill"
          style={{ width: `${((quiz.index + 1) / quiz.total) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <main className="quiz-main">
        <div className="quiz-content">
          <div className="quiz-qnum">Question {quiz.index + 1}</div>
          <QuestionCard
            key={quiz.current?.id}
            question={quiz.current}
            chosen={localAnswer}
            onAnswer={setLocalAnswer}
            isLocked={quiz.lockedQuestions.has(quiz.current?.id)}
          />
        </div>

        {/* Nav */}
        <div className="quiz-nav">
          <button
            className="btn btn-ghost"
            onClick={handlePrev}
            disabled={quiz.index === 0}
          >
            ← Previous
          </button>

          <div className="quiz-nav__stats">
            <span>{confirmedCount} answered</span>
            {markedArr.length > 0 && <span>{markedArr.length} marked</span>}
          </div>

          {quiz.index < quiz.total - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>Next →</button>
          ) : (
            <button className="btn btn-amber" onClick={handleSubmit}>Submit Exam</button>
          )}
        </div>
      </main>

      {/* Review panel */}
      {showPanel && (
        <ReviewPanel
          questions={quiz.questions}
          answers={quiz.answers}
          marked={quiz.marked}
          lockedQuestions={quiz.lockedQuestions}
          currentIndex={quiz.index}
          onGoTo={handleGoTo}
          onClose={() => setShowPanel(false)}
        />
      )}

      {/* Exit confirm */}
      {confirmExit && (
        <div className="quiz-overlay">
          <div className="quiz-dialog card">
            <h3>Exit exam?</h3>
            <p>Your progress will be lost and no score will be saved.</p>
            <div className="quiz-dialog__btns">
              <button className="btn btn-ghost" onClick={() => setConfirmExit(false)}>
                Keep going
              </button>
              <button className="btn btn-danger" onClick={onExit}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

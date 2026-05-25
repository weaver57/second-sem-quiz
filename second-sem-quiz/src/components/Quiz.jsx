import { useState } from 'react'
import { QUESTIONS } from '../data/questions.js'
import { useQuiz } from '../hooks/useQuiz.js'
import Timer from './Timer.jsx'
import QuestionCard from './QuestionCard.jsx'
import ReviewPanel from './ReviewPanel.jsx'
import './Quiz.css'

export default function Quiz({ subject, userName, onFinish, onExit }) {
  const filtered = QUESTIONS[subject] || []
  const quiz = useQuiz(filtered)
  const [showPanel, setShowPanel] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  // When finished, pass results up
  if (quiz.finished && quiz.results) {
    onFinish(quiz.results, subject)
    return null
  }

  const answered  = Object.keys(quiz.answers).length
  const markedArr = Array.from(quiz.marked)

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
            chosen={quiz.answers[quiz.current?.id]}
            onAnswer={quiz.answer}
          />
        </div>

        {/* Nav */}
        <div className="quiz-nav">
          <button
            className="btn btn-ghost"
            onClick={quiz.goPrev}
            disabled={quiz.index === 0}
          >
            ← Previous
          </button>

          <div className="quiz-nav__stats">
            <span>{answered} answered</span>
            {markedArr.length > 0 && <span>{markedArr.length} marked</span>}
          </div>

          {quiz.index < quiz.total - 1 ? (
            <button className="btn btn-primary" onClick={() => quiz.goNext()}>
              Next →
            </button>
          ) : (
            <button className="btn btn-amber" onClick={quiz.finishEarly}>
              Submit Exam
            </button>
          )}
        </div>
      </main>

      {/* Review panel */}
      {showPanel && (
        <ReviewPanel
          questions={quiz.questions}
          answers={quiz.answers}
          marked={quiz.marked}
          currentIndex={quiz.index}
          onGoTo={quiz.goTo}
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

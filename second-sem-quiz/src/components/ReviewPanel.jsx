import './ReviewPanel.css'

export default function ReviewPanel({ questions, answers, marked, lockedQuestions, currentIndex, onGoTo, onClose }) {
  return (
    <div className="review-panel">
      <div className="review-panel__header">
        <span>Question Map</span>
        <button className="review-panel__close" onClick={onClose}>✕</button>
      </div>
      <div className="review-panel__grid">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id]
          const isMarked   = marked.has(q.id)
          const isCurrent  = i === currentIndex
          const isLocked   = lockedQuestions.has(q.id)  // ← add this line
          return (
            <button
              key={q.id}
              className={[
                'review-panel__dot',
                isCurrent  ? 'is-current'  : '',
                isAnswered ? 'is-answered' : '',
                isMarked   ? 'is-marked'   : '',
                isLocked   ? 'is-locked'   : '',
              ].join(' ')}
              onClick={() => { onGoTo(i); onClose() }}
              title={`Q${i + 1}${isMarked ? ' · Marked' : ''}${isAnswered ? ' · Answered' : ''}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <div className="review-panel__legend">
        <span className="rp-leg rp-leg--answered">Answered</span>
        <span className="rp-leg rp-leg--marked">Marked</span>
        <span className="rp-leg rp-leg--unanswered">Unanswered</span>
        <span className="rp-leg rp-leg--locked">Timed out</span>
      </div>
    </div>
  )
}

import './QuestionCard.css'

const OPTS = ['A', 'B', 'C', 'D', 'E']

export default function QuestionCard({ question, chosen, onAnswer }) {
  if (!question) return null

  return (
    <div className="qcard">
      <p className="qcard__text">{question.question}</p>
      <div className="qcard__options">
        {OPTS.map(opt => {
          const val = question.options[opt]
          if (!val) return null
          const selected = chosen === opt
          return (
            <button
              key={opt}
              className={`qcard__opt ${selected ? 'qcard__opt--selected' : ''}`}
              onClick={() => onAnswer(opt)}
            >
              <span className="qcard__opt-key">{opt}</span>
              <span className="qcard__opt-val">{val}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

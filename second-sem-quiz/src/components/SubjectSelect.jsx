import './SubjectSelect.css'
import { QUESTIONS } from '../data/questions.js'

const SUBJECTS = [
  {
    id: 'Sociology',
    label: 'Sociology',
    desc: 'Social behaviour, institutions, and conflict theory.',
    color: 'blue',
    count: QUESTIONS['Sociology'].length,
  },
  {
    id: 'Culturology',
    label: 'Culturology',
    desc: 'Culture, civilisation, and the philosophy of human societies.',
    color: 'amber',
    count: QUESTIONS['Culturology'].length,
  },
  {
    id: 'History',
    label: 'History',
    desc: 'Historical events, figures, and processes.',
    color: 'green',
    count: QUESTIONS['History'].length,
  },
]

export default function SubjectSelect({ userName, onStart, onLeaderboard }) {
  return (
    <div className="subject-select">
      <header className="ss-header">
        <span className="ss-logo">CBT PREP</span>
        <div className="ss-user">
          <span className="ss-user__label">Signed in as</span>
          <span className="ss-user__name">{userName}</span>
        </div>
      </header>

      <main className="ss-main">
        <h1 className="ss-title">Choose a subject.</h1>
        <p className="ss-sub">60 seconds per question · questions shuffled each attempt</p>

        <div className="ss-grid">
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              className={`ss-card ss-card--${s.color}`}
              onClick={() => onStart(s.id)}
            >
              <span className={`tag tag-${s.id.toLowerCase()}`}>{s.count} questions</span>
              <h2 className="ss-card__title">{s.label}</h2>
              <p className="ss-card__desc">{s.desc}</p>
              <span className="ss-card__cta">Start exam →</span>
            </button>
          ))}
        </div>

        <button className="btn btn-ghost ss-leaderboard-btn" onClick={onLeaderboard}>
          View leaderboard ↗
        </button>
      </main>
    </div>
  )
}

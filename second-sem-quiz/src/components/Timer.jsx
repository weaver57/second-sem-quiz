import './Timer.css'

const R = 22
const CIRC = 2 * Math.PI * R

export default function Timer({ timeLeft }) {
  const progress = timeLeft / 60
  const dashoffset = CIRC * (1 - progress)
  const urgent = timeLeft <= 10

  return (
    <div className={`timer ${urgent ? 'timer--urgent' : ''}`}>
      <svg viewBox="0 0 52 52" className="timer__ring">
        <circle cx="26" cy="26" r={R} className="timer__track" />
        <circle
          cx="26" cy="26" r={R}
          className="timer__fill"
          strokeDasharray={CIRC}
          strokeDashoffset={dashoffset}
          transform="rotate(-90 26 26)"
        />
      </svg>
      <span className="timer__text">{timeLeft}</span>
    </div>
  )
}

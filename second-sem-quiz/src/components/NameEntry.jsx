import { useState } from 'react'
import './NameEntry.css'

export default function NameEntry({ onDone }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name.'); return }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return }
    localStorage.setItem('quiz_user', trimmed)
    onDone(trimmed)
  }

  return (
    <div className="name-entry">
      <div className="name-entry__inner">
        <div className="name-entry__logo">CBT PREP</div>
        <h1 className="name-entry__title">Welcome.</h1>
        <p className="name-entry__sub">
          Enter your name to get started. You'll only be asked once on this device.
        </p>
        <div className="name-entry__form">
          <input
            className="name-entry__input"
            type="text"
            placeholder="Your name or roll number"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
            maxLength={40}
          />
          {error && <p className="name-entry__error">{error}</p>}
          <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
            Continue →
          </button>
        </div>
        <p className="name-entry__note">
          Your name identifies you on the leaderboard.
        </p>
      </div>
    </div>
  )
}

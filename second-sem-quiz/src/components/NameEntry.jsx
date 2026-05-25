import { useState } from 'react'
import './NameEntry.css'

export default function NameEntry({ onDone, onToggleDark }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name.'); return }
    if (trimmed.length < 2) { setError('Name must be at least 2 characters.'); return }
    localStorage.setItem('quiz_user', trimmed)
    onDone(trimmed)
  }

  /* NEW */
  return (
    <div className="name-entry">
      <div className="name-entry__topbar">
        <button className="dark-toggle" onClick={onToggleDark} aria-label="Toggle dark mode" />
      </div>
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
            /* NEW */
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
            autoComplete="name"
            maxLength={40}
          />
          /* NEW */
          <div className="name-entry__error-wrap">
            {error && <p className="name-entry__error">{error}</p>}
          </div>
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

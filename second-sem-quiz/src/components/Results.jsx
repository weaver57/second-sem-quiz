import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { supabase } from '../lib/supabase.js'
import './Results.css'


const COLORS = {
  correct:   '#15803d',
  incorrect: '#b91c1c',
  skipped:   '#9a9693',
}

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec.toString().padStart(2, '0')}s`
}

export default function Results({ results, subject, userName, onRetry, onHome, onToggleDark }) {
  const { correct, incorrect, skipped, total, percentage, timeTaken, breakdown } = results
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('overview') // overview | breakdown

  const savedRef = useRef(false)

  useEffect(() => {
    if (savedRef.current) return
    savedRef.current = true

    async function save() {
      try {
        await supabase.from('scores').insert({
          user_name: userName,
          subject,
          score: correct,
          total,
          percentage,
          time_taken: timeTaken,
          answers: Object.fromEntries(
            breakdown.map(q => [q.id, { chosen: q.chosen, correct: q.answer, status: q.status }])
          ),
        })
        setSaved(true)
      } catch (e) {
        console.error('Error saving score:', e)
      }
    }
    save()
  }, [])

  const pieData = [
    { name: 'Correct',   value: correct },
    { name: 'Incorrect', value: incorrect },
    { name: 'Skipped',   value: skipped },
  ]

  // Group incorrect by question for bar chart (top 5 most relevant insight)
  // Actually show: score distribution among question positions
  // Better: show breakdown of each status as bar
  const barData = [
    { label: 'Correct',   count: correct,   fill: COLORS.correct },
    { label: 'Incorrect', count: incorrect, fill: COLORS.incorrect },
    { label: 'Skipped',   count: skipped,   fill: COLORS.skipped },
  ]

  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B'
               : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F'

  return (
    <div className="results">
      <header className="results-header">
        <span className={`tag tag-${subject.toLowerCase()}`}>{subject}</span>
        <div className="results-header__user">{userName}</div>
        <button className="dark-toggle" onClick={onToggleDark} aria-label="Toggle dark mode" />
      </header>

      <main className="results-main">
        {/* Score hero */}
        <div className="results-hero card">
          <div className="results-hero__grade">{grade}</div>
          <div className="results-hero__pct">{percentage}%</div>
          <div className="results-hero__score">{correct} / {total} correct</div>
          <div className="results-hero__time">
            <span>⏱ {fmtTime(timeTaken)}</span>
            {saved && <span className="results-hero__saved">✓ Saved to leaderboard</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="results-tabs">
          <button
            className={`results-tab ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            Overview
          </button>
          <button
            className={`results-tab ${tab === 'breakdown' ? 'active' : ''}`}
            onClick={() => setTab('breakdown')}
          >
            Question Breakdown
          </button>
        </div>

        {tab === 'overview' && (
          <div className="results-charts">
            {/* Pie */}
            <div className="card results-chart-card">
              <h3 className="results-chart-title">Score distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={Object.values(COLORS)[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} questions`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="results-legend">
                {pieData.map((d, i) => (
                  <span key={i} className="results-legend__item">
                    <span className="results-legend__dot" style={{ background: Object.values(COLORS)[i] }} />
                    {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Bar */}
            <div className="card results-chart-card">
              <h3 className="results-chart-title">At a glance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fontFamily: 'DM Mono' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'DM Mono' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {barData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats row */}
            <div className="results-stats">
              <div className="results-stat">
                <span className="results-stat__val">{correct}</span>
                <span className="results-stat__label">Correct</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__val">{incorrect}</span>
                <span className="results-stat__label">Incorrect</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__val">{skipped}</span>
                <span className="results-stat__label">Skipped</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__val">{fmtTime(timeTaken)}</span>
                <span className="results-stat__label">Time taken</span>
              </div>
              <div className="results-stat">
                <span className="results-stat__val">
                  {timeTaken > 0 ? Math.round(timeTaken / total) : 0}s
                </span>
                <span className="results-stat__label">Avg / question</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'breakdown' && (
          <div className="results-breakdown">
            {breakdown.map((q, i) => (
              <div
                key={q.id}
                className={`rb-item rb-item--${q.status}`}
              >
                <div className="rb-item__header">
                  <span className="rb-item__num">Q{i + 1}</span>
                  <span className={`rb-item__badge rb-badge--${q.status}`}>
                    {q.status}
                  </span>
                </div>
                <p className="rb-item__q">{q.question}</p>
                <div className="rb-item__answers">
                  {q.chosen && (
                    <span className="rb-item__ans rb-item__ans--chosen">
                      Your answer: {q.chosen} — {q.options[q.chosen]}
                    </span>
                  )}
                  {q.status !== 'correct' && (
                    <span className="rb-item__ans rb-item__ans--correct">
                      Correct: {q.answer} — {q.options[q.answer]}
                    </span>
                  )}
                  {!q.chosen && (
                    <span className="rb-item__ans rb-item__ans--skip">Not answered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="results-actions">
          <button className="btn btn-ghost" onClick={onHome}>← Home</button>
          <button className="btn btn-primary" onClick={onRetry}>Try again →</button>
        </div>
      </main>
    </div>
  )
}

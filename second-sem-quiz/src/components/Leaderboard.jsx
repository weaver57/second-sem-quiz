import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import './Leaderboard.css'

const SUBJECTS = ['Sociology', 'Culturology', 'History']

function fmtTime(s) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec.toString().padStart(2, '0')}s`
}

export default function Leaderboard({ userName, onBack }) {
  const [tab, setTab]       = useState('Sociology')
  const [rows, setRows]     = useState([])
  const [myHistory, setMyHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]     = useState('global') // global | mine

  useEffect(() => {
    async function load() {
      setLoading(true)
      // Best score per user for current subject (leaderboard)
      const { data: all } = await supabase
        .from('scores')
        .select('user_name, score, total, percentage, time_taken, created_at')
        .eq('subject', tab)
        .order('percentage', { ascending: false })

      // Deduplicate: keep best score per user
      const seen = new Map()
      for (const row of (all || [])) {
        const prev = seen.get(row.user_name)
        if (!prev || row.percentage > prev.percentage) seen.set(row.user_name, row)
      }
      setRows([...seen.values()].sort((a,b) => b.percentage - a.percentage))

      // Personal history
      const { data: hist } = await supabase
        .from('scores')
        .select('score, total, percentage, time_taken, created_at')
        .eq('subject', tab)
        .eq('user_name', userName)
        .order('created_at', { ascending: false })
        .limit(20)

      setMyHistory(hist || [])
      setLoading(false)
    }
    load()
  }, [tab, userName])

  return (
    <div className="lb">
      <header className="lb-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <span className="lb-title">Leaderboard</span>
        <div />
      </header>

      <div className="lb-tabs">
        {SUBJECTS.map(s => (
          <button
            key={s}
            className={`lb-subject-tab ${tab === s ? 'active' : ''}`}
            onClick={() => setTab(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="lb-view-toggle">
        <button className={`btn btn-sm ${view === 'global' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setView('global')}>Global</button>
        <button className={`btn btn-sm ${view === 'mine' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setView('mine')}>My history</button>
      </div>

      <main className="lb-main">
        {loading ? (
          <div className="lb-loading">Loading…</div>
        ) : view === 'global' ? (
          rows.length === 0 ? (
            <p className="lb-empty">No attempts yet for {tab}. Be the first!</p>
          ) : (
            <div className="lb-table">
              <div className="lb-table__head">
                <span>#</span>
                <span>Name</span>
                <span>Score</span>
                <span>%</span>
                <span>Time</span>
              </div>
              {rows.map((r, i) => (
                <div
                  key={r.user_name}
                  className={`lb-table__row ${r.user_name === userName ? 'is-me' : ''}`}
                >
                  <span className="lb-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <span className="lb-name">{r.user_name}</span>
                  <span className="lb-score">{r.score}/{r.total}</span>
                  <span className="lb-pct">{r.percentage}%</span>
                  <span className="lb-time">{fmtTime(r.time_taken)}</span>
                </div>
              ))}
            </div>
          )
        ) : (
          myHistory.length === 0 ? (
            <p className="lb-empty">You haven't attempted {tab} yet.</p>
          ) : (
            <div className="lb-table">
              <div className="lb-table__head">
                <span>#</span>
                <span>Date</span>
                <span>Score</span>
                <span>%</span>
                <span>Time</span>
              </div>
              {myHistory.map((r, i) => (
                <div key={r.created_at} className="lb-table__row">
                  <span className="lb-rank">{i + 1}</span>
                  <span className="lb-name">
                    {new Date(r.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: '2-digit'
                    })}
                  </span>
                  <span className="lb-score">{r.score}/{r.total}</span>
                  <span className="lb-pct">{r.percentage}%</span>
                  <span className="lb-time">{fmtTime(r.time_taken)}</span>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}

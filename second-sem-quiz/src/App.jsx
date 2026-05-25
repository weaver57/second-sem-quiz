import { useState, useEffect } from 'react'
import NameEntry from './components/NameEntry.jsx'
import SubjectSelect from './components/SubjectSelect.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Leaderboard from './components/Leaderboard.jsx'

// Views: 'name' | 'home' | 'quiz' | 'results' | 'leaderboard'

export default function App() {
  const [view, setView]       = useState('loading')
  const [userName, setUserName] = useState(null)
  const [subject, setSubject] = useState(null)
  const [lastResults, setLastResults] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('quiz_user')
    if (saved) {
      setUserName(saved)
      setView('home')
    } else {
      setView('name')
    }
  }, [])

  function handleNameDone(name) {
    setUserName(name)
    setView('home')
  }

  function handleStart(sub) {
    setSubject(sub)
    setView('quiz')
  }

  function handleFinish(results, sub) {
    setLastResults(results)
    setSubject(sub)
    setView('results')
  }

  function handleRetry() {
    setView('quiz')
  }

  if (view === 'loading') return null

  return (
    <>
      {view === 'name' && (
        <NameEntry onDone={handleNameDone} />
      )}

      {view === 'home' && (
        <SubjectSelect
          userName={userName}
          onStart={handleStart}
          onLeaderboard={() => setView('leaderboard')}
        />
      )}

      {view === 'quiz' && (
        <Quiz
          subject={subject}
          userName={userName}
          onFinish={handleFinish}
          onExit={() => setView('home')}
        />
      )}

      {view === 'results' && lastResults && (
        <Results
          results={lastResults}
          subject={subject}
          userName={userName}
          onRetry={handleRetry}
          onHome={() => setView('home')}
        />
      )}

      {view === 'leaderboard' && (
        <Leaderboard
          userName={userName}
          onBack={() => setView('home')}
        />
      )}
    </>
  )
}

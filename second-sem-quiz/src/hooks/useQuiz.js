import { useState, useEffect, useCallback, useRef } from 'react'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useQuiz(questions) {
  const [shuffled, setShuffled] = useState([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})      // { questionId: 'A'|'B'|'C'|'D' }
  const [marked, setMarked] = useState(new Set()) // Set of question ids
  const [timeLeft, setTimeLeft] = useState(60)
  const [finished, setFinished] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeTaken, setTimeTaken] = useState(0)
  const timerRef = useRef(null)

  // Shuffle questions on mount
  useEffect(() => {
    setShuffled(shuffle(questions))
  }, [questions])

  const current = shuffled[index]

  // Timer: reset to 60 whenever index changes
  useEffect(() => {
    if (finished || shuffled.length === 0) return
    setTimeLeft(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Auto-advance on timeout
          clearInterval(timerRef.current)
          goNext(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [index, shuffled.length, finished])

  const goNext = useCallback((fromTimer = false) => {
    setIndex(i => {
      if (i >= shuffled.length - 1) {
        clearInterval(timerRef.current)
        setTimeTaken(Math.round((Date.now() - startTime) / 1000))
        setFinished(true)
        return i
      }
      return i + 1
    })
  }, [shuffled.length, startTime])

  const goPrev = useCallback(() => {
    if (index > 0) setIndex(i => i - 1)
  }, [index])

  const goTo = useCallback((i) => {
    if (i >= 0 && i < shuffled.length) setIndex(i)
  }, [shuffled.length])

  const answer = useCallback((option) => {
    if (!current) return
    setAnswers(prev => ({ ...prev, [current.id]: option }))
  }, [current])

  const toggleMark = useCallback(() => {
    if (!current) return
    setMarked(prev => {
      const next = new Set(prev)
      if (next.has(current.id)) next.delete(current.id)
      else next.add(current.id)
      return next
    })
  }, [current])

  const finishEarly = useCallback(() => {
    clearInterval(timerRef.current)
    setTimeTaken(Math.round((Date.now() - startTime) / 1000))
    setFinished(true)
  }, [startTime])

  // Compute results
  const results = finished ? computeResults(shuffled, answers, timeTaken) : null

  return {
    questions: shuffled,
    current,
    index,
    total: shuffled.length,
    answers,
    marked,
    timeLeft,
    finished,
    results,
    answer,
    toggleMark,
    goNext,
    goPrev,
    goTo,
    finishEarly,
  }
}

function computeResults(questions, answers, timeTaken) {
  let correct = 0
  let incorrect = 0
  let skipped = 0
  const breakdown = questions.map(q => {
    const chosen = answers[q.id]
    if (!chosen) { skipped++; return { ...q, chosen: null, status: 'skipped' } }
    if (chosen === q.answer) { correct++; return { ...q, chosen, status: 'correct' } }
    incorrect++
    return { ...q, chosen, status: 'incorrect' }
  })
  const score = correct
  const total = questions.length
  const percentage = Math.round((correct / total) * 100)
  return { correct, incorrect, skipped, score, total, percentage, timeTaken, breakdown }
}

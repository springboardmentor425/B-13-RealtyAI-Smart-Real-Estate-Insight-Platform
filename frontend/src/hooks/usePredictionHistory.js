import { useState, useCallback } from 'react'

const KEY = 'hpa_history'
const MAX = 15

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
  catch { return [] }
}

/**
 * Persistent prediction history backed by localStorage.
 * Entry shape: { id, ts, type, label, price }
 */
export function usePredictionHistory() {
  const [history, setHistory] = useState(read)

  const addEntry = useCallback(({ type, label, price }) => {
    setHistory(prev => {
      const next = [
        { id: Date.now(), ts: new Date().toISOString(), type, label, price },
        ...prev,
      ].slice(0, MAX)
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(KEY)
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}

import { useState, useEffect, useCallback } from 'react'

// Bloqueos en segundos por número de intentos fallidos consecutivos
// idx 0 → 3er intento, idx 1 → 4to, etc.
const LOCKOUTS = [30, 60, 120, 300, 600]
const FREE_ATTEMPTS = 2 // primeros N fallos sin bloqueo

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || { attempts: 0, lockedUntil: 0 }
  } catch {
    return { attempts: 0, lockedUntil: 0 }
  }
}

export function useRateLimit(key) {
  const storageKey = `rl_${key}`
  const [state, setState] = useState(() => load(storageKey))
  const [secondsLeft, setSecondsLeft] = useState(0)

  const isLocked = state.lockedUntil > Date.now()

  // Countdown ticker
  useEffect(() => {
    if (!isLocked) { setSecondsLeft(0); return }
    const tick = () => {
      const left = Math.ceil((state.lockedUntil - Date.now()) / 1000)
      if (left <= 0) {
        setSecondsLeft(0)
        setState(s => ({ ...s, lockedUntil: 0 }))
      } else {
        setSecondsLeft(left)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state.lockedUntil, isLocked])

  const onFailure = useCallback(() => {
    const current = load(storageKey)
    const attempts = current.attempts + 1
    const tier = Math.min(attempts - FREE_ATTEMPTS - 1, LOCKOUTS.length - 1)
    const lockedUntil = attempts > FREE_ATTEMPTS
      ? Date.now() + LOCKOUTS[tier] * 1000
      : 0
    const next = { attempts, lockedUntil }
    localStorage.setItem(storageKey, JSON.stringify(next))
    setState(next)
  }, [storageKey])

  const onSuccess = useCallback(() => {
    localStorage.removeItem(storageKey)
    setState({ attempts: 0, lockedUntil: 0 })
  }, [storageKey])

  const formatTime = (s) => {
    if (s >= 60) return `${Math.ceil(s / 60)} min`
    return `${s}s`
  }

  return {
    isLocked,
    secondsLeft,
    attempts: state.attempts,
    lockMessage: isLocked
      ? `Demasiados intentos. Espera ${formatTime(secondsLeft)}.`
      : null,
    onFailure,
    onSuccess,
  }
}

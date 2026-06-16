import { createContext, useContext, useReducer, useEffect, useMemo, useRef } from 'react'
import { seedData } from '../utils/seedData'
import { reducer, ACTIONS } from './actions'
import { supabase } from '../lib/supabase'

const FinanceContext = createContext(null)

const makeKey = (profileId) => `df-data-${profileId}`
const currentYear = String(new Date().getFullYear())

const mergeWithSeed = (parsed) => {
  if (!parsed) return { ...seedData, config: { ...seedData.config, anioActual: currentYear } }
  const mergedConfig   = { ...seedData.config, ...parsed.config, anioActual: currentYear }
  const mergedEstudio  = { ...seedData.estudio, ...parsed.estudio }
  if (!mergedEstudio.distribucion) mergedEstudio.distribucion = seedData.estudio.distribucion
  return { ...seedData, ...parsed, personal: { ...seedData.personal, ...parsed.personal }, estudio: mergedEstudio, config: mergedConfig }
}

const loadLocal = (profileId) => {
  try {
    const raw = localStorage.getItem(makeKey(profileId))
    return mergeWithSeed(raw ? JSON.parse(raw) : null)
  } catch {
    return mergeWithSeed(null)
  }
}

export function FinanceProvider({ children, profileId }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadLocal(profileId))
  const syncTimer = useRef(null)

  // On mount: load cloud data and replace local state (cloud is authoritative)
  useEffect(() => {
    supabase
      .from('finance_data')
      .select('data')
      .eq('user_id', profileId)
      .single()
      .then(({ data }) => {
        if (data?.data) {
          const merged = mergeWithSeed(data.data)
          dispatch({ type: ACTIONS.IMPORT_DATA, data: merged })
          localStorage.setItem(makeKey(profileId), JSON.stringify(merged))
        }
      })
  }, [profileId])

  // Save to localStorage on every state change + debounced cloud save
  useEffect(() => {
    try {
      localStorage.setItem(makeKey(profileId), JSON.stringify(state))
    } catch { /* storage full */ }

    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      supabase
        .from('finance_data')
        .upsert({ user_id: profileId, data: state, updated_at: new Date().toISOString() })
        .then()
    }, 2000)

    return () => clearTimeout(syncTimer.current)
  }, [state, profileId])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider')
  return ctx
}

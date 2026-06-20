import { createContext, useContext, useReducer, useEffect, useMemo, useRef, useState } from 'react'
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
  const mergedPersonal = { ...seedData.personal, ...parsed.personal }
  // Migrate old flat-ingresos → ingresosMensuales (remove legacy field)
  if (!mergedPersonal.ingresosMensuales) mergedPersonal.ingresosMensuales = {}
  delete mergedPersonal.ingresos
  return { ...seedData, ...parsed, personal: mergedPersonal, estudio: mergedEstudio, config: mergedConfig }
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
  const [cloudLoading, setCloudLoading] = useState(true)
  const syncTimer    = useRef(null)
  const cloudReady   = useRef(false)

  // On mount: load cloud data (authoritative source)
  useEffect(() => {
    cloudReady.current = false
    setCloudLoading(true)
    supabase
      .from('finance_data')
      .select('data')
      .eq('user_id', profileId)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error('[FinanceContext] cloud load error:', error)
        }
        if (data?.data) {
          const merged = mergeWithSeed(data.data)
          // Existing users with saved cloud data skip onboarding
          if (!merged.config.onboardingDone) {
            merged.config.onboardingDone = true
          }
          dispatch({ type: ACTIONS.IMPORT_DATA, data: merged })
          localStorage.setItem(makeKey(profileId), JSON.stringify(merged))
        }
        cloudReady.current = true
        setCloudLoading(false)
      })
  }, [profileId])

  // Save to localStorage on every state change + debounced cloud save
  useEffect(() => {
    try {
      localStorage.setItem(makeKey(profileId), JSON.stringify(state))
    } catch { /* storage full */ }

    if (!cloudReady.current) return  // skip cloud save until initial load completes

    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      supabase
        .from('finance_data')
        .upsert({ user_id: profileId, data: state, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.error('[FinanceContext] cloud save error:', error)
        })
    }, 2000)

    return () => clearTimeout(syncTimer.current)
  }, [state, profileId])

  const value = useMemo(() => ({ state, dispatch, cloudLoading }), [state, cloudLoading])

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

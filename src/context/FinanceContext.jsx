import { createContext, useContext, useReducer, useEffect, useMemo, useRef, useState } from 'react'
import { seedData } from '../utils/seedData'
import { reducer, ACTIONS } from './actions'
import { supabase } from '../lib/supabase'

const FinanceContext = createContext(null)

const makeKey = (profileId) => `df-data-${profileId}`
const currentYear = String(new Date().getFullYear())

const saveToCloud = (profileId, state, onError) =>
  supabase
    .from('finance_data')
    .upsert(
      { user_id: profileId, data: state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .then(({ error }) => {
      if (error) {
        console.error('[FinanceContext] cloud save error:', error.message, error.code, error.details)
        onError?.()
      }
    })

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
  const [cloudSyncOk, setCloudSyncOk]   = useState(true)
  const syncTimer    = useRef(null)
  const cloudReady   = useRef(false)
  const pendingSave  = useRef(null)
  const latestState  = useRef(state)

  // Keep latestState ref in sync — needed by cloud load callback which captures stale closure
  useEffect(() => { latestState.current = state })

  // On mount: load cloud data (authoritative source)
  useEffect(() => {
    cloudReady.current = false
    setCloudLoading(true)
    supabase
      .from('finance_data')
      .select('data')
      .eq('user_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .then(({ data: rows, error }) => {
        if (error) {
          console.error('[FinanceContext] cloud load error:', error.message, error.code)
        }
        const row = rows?.[0]
        if (row?.data) {
          const merged = mergeWithSeed(row.data)
          const needsReset = !merged.config.dataVersion || merged.config.dataVersion < 2
          const toLoad = needsReset ? mergeWithSeed(null) : merged
          if (needsReset) localStorage.removeItem(makeKey(profileId))
          dispatch({ type: ACTIONS.IMPORT_DATA, data: toLoad })
          localStorage.setItem(makeKey(profileId), JSON.stringify(toLoad))
        }
        cloudReady.current = true
        setCloudLoading(false)
        // Bootstrap: if no cloud data found and no network error, push local data up now
        if (!error && !row?.data) {
          saveToCloud(profileId, latestState.current, () => setCloudSyncOk(false))
        }
      })
  }, [profileId])

  // Save to localStorage on every state change + debounced cloud save
  useEffect(() => {
    try {
      localStorage.setItem(makeKey(profileId), JSON.stringify(state))
    } catch { /* storage full */ }

    if (!cloudReady.current) return

    pendingSave.current = state
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      pendingSave.current = null
      saveToCloud(profileId, state, () => setCloudSyncOk(false))
    }, 800)

    return () => clearTimeout(syncTimer.current)
  }, [state, profileId])

  // Flush pending cloud save when user switches tabs/apps or closes the page
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden' && cloudReady.current && pendingSave.current) {
        clearTimeout(syncTimer.current)
        saveToCloud(profileId, pendingSave.current, () => setCloudSyncOk(false))
        pendingSave.current = null
      }
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [profileId])

  const value = useMemo(() => ({ state, dispatch, cloudLoading, cloudSyncOk }), [state, cloudLoading, cloudSyncOk])

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

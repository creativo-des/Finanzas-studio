import { createContext, useContext, useReducer, useEffect, useMemo, useRef, useState } from 'react'
import { seedData } from '../utils/seedData'
import { reducer, ACTIONS } from './actions'
import { supabase } from '../lib/supabase'

const FinanceContext = createContext(null)

// Clave por modo — cada modo tiene su propio espacio en localStorage y en la nube
const makeKey = (profileId, mode) => `df-data-${profileId}-${mode}`
const currentYear = String(new Date().getFullYear())

const saveToCloud = (profileId, mode, state, onError) =>
  supabase
    .from('finance_data')
    .upsert(
      { user_id: profileId, mode, data: state, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,mode' }
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
  if (!mergedPersonal.ingresosMensuales) mergedPersonal.ingresosMensuales = {}
  delete mergedPersonal.ingresos
  return { ...seedData, ...parsed, personal: mergedPersonal, estudio: mergedEstudio, config: mergedConfig }
}

const loadLocal = (profileId, mode) => {
  try {
    // Clave nueva (por modo)
    const raw = localStorage.getItem(makeKey(profileId, mode))
    if (raw) return mergeWithSeed(JSON.parse(raw))

    // Migración: clave antigua sin modo → sirve de punto de partida para ambos modos
    const legacy = localStorage.getItem(`df-data-${profileId}`)
    return mergeWithSeed(legacy ? JSON.parse(legacy) : null)
  } catch {
    return mergeWithSeed(null)
  }
}

export function FinanceProvider({ children, profileId, mode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadLocal(profileId, mode))
  const [cloudLoading, setCloudLoading] = useState(true)
  const [cloudSyncOk, setCloudSyncOk]   = useState(true)
  const syncTimer    = useRef(null)
  const cloudReady   = useRef(false)
  const pendingSave  = useRef(null)
  const latestState  = useRef(state)

  useEffect(() => { latestState.current = state })

  // On mount: carga datos de la nube del modo actual
  useEffect(() => {
    cloudReady.current = false
    setCloudLoading(true)
    supabase
      .from('finance_data')
      .select('data')
      .eq('user_id', profileId)
      .eq('mode', mode)
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
          let toLoad = needsReset ? mergeWithSeed(null) : merged
          if (needsReset) localStorage.removeItem(makeKey(profileId, mode))

          // Preservar cambios locales que ocurrieron antes de que cloud cargara
          // o que no alcanzaron a sincronizarse en la sesión anterior
          const local = latestState.current
          const mergeById = (cloudArr, localArr) => {
            if (!localArr?.length) return cloudArr ?? []
            const cloudIds = new Set((cloudArr ?? []).map(i => i.id))
            const onlyLocal = localArr.filter(i => !cloudIds.has(i.id))
            return [...(cloudArr ?? []), ...onlyLocal]
          }
          toLoad = {
            ...toLoad,
            personal: {
              ...toLoad.personal,
              deudas:   mergeById(toLoad.personal?.deudas,   local.personal?.deudas),
              metas:    mergeById(toLoad.personal?.metas,    local.personal?.metas),
              tarjetas: mergeById(toLoad.personal?.tarjetas, local.personal?.tarjetas),
              patrimonio: {
                ...toLoad.personal?.patrimonio,
                activos: mergeById(
                  toLoad.personal?.patrimonio?.activos,
                  local.personal?.patrimonio?.activos
                ),
              },
            },
          }

          dispatch({ type: ACTIONS.IMPORT_DATA, data: toLoad })
          localStorage.setItem(makeKey(profileId, mode), JSON.stringify(toLoad))
        }
        cloudReady.current = true
        setCloudLoading(false)
        if (!error && !row?.data) {
          saveToCloud(profileId, mode, latestState.current, () => setCloudSyncOk(false))
        }
      })
  }, [profileId, mode])

  // Guarda en localStorage en cada cambio + debounce a la nube
  useEffect(() => {
    try {
      localStorage.setItem(makeKey(profileId, mode), JSON.stringify(state))
    } catch { /* storage full */ }

    if (!cloudReady.current) return

    pendingSave.current = state
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      pendingSave.current = null
      saveToCloud(profileId, mode, state, () => setCloudSyncOk(false))
    }, 800)

    return () => clearTimeout(syncTimer.current)
  }, [state, profileId, mode])

  // Flush al cambiar de pestaña o cerrar
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden' && cloudReady.current && pendingSave.current) {
        clearTimeout(syncTimer.current)
        saveToCloud(profileId, mode, pendingSave.current, () => setCloudSyncOk(false))
        pendingSave.current = null
      }
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
  }, [profileId, mode])

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

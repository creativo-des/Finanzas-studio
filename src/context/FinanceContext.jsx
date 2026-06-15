import { createContext, useContext, useReducer, useEffect, useMemo } from 'react'
import { seedData } from '../utils/seedData'
import { reducer } from './actions'

const FinanceContext = createContext(null)

const makeKey = (profileId) => `df-data-${profileId}`

const currentYear = String(new Date().getFullYear())

const loadState = (profileId) => {
  try {
    const raw = localStorage.getItem(makeKey(profileId))
    if (raw) {
      const parsed = JSON.parse(raw)
      const mergedConfig = { ...seedData.config, ...parsed.config }
      // Siempre usar el año actual
      mergedConfig.anioActual = currentYear
      const mergedEstudio = { ...seedData.estudio, ...parsed.estudio }
      // Asegurar estructura distribucion si el perfil es antiguo
      if (!mergedEstudio.distribucion) mergedEstudio.distribucion = seedData.estudio.distribucion
      return {
        ...seedData,
        ...parsed,
        personal: { ...seedData.personal, ...parsed.personal },
        estudio:  mergedEstudio,
        config:   mergedConfig,
      }
    }
    return { ...seedData, config: { ...seedData.config, anioActual: currentYear } }
  } catch {
    return { ...seedData, config: { ...seedData.config, anioActual: currentYear } }
  }
}

export function FinanceProvider({ children, profileId }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState(profileId))

  // Persistir al cambiar estado
  useEffect(() => {
    try {
      localStorage.setItem(makeKey(profileId), JSON.stringify(state))
    } catch {
      // Storage lleno
    }
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

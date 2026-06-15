import { createContext, useContext, useState, useEffect } from 'react'

const PROFILES_KEY = 'df-profiles-v1'
const uid = () => Math.random().toString(36).slice(2, 9)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [profiles, setProfiles]         = useState([])
  const [activeProfile, setActiveProfile] = useState(null)
  const [mode, setMode]                 = useState(null) // 'personal' | 'estudio' | null
  const [ready, setReady]               = useState(false)

  // Cargar perfiles al arrancar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILES_KEY)
      const parsed = raw ? JSON.parse(raw) : { profiles: [] }
      setProfiles(parsed.profiles || [])
    } catch {
      setProfiles([])
    }
    setReady(true)
  }, [])

  const persistProfiles = (ps) => {
    setProfiles(ps)
    localStorage.setItem(PROFILES_KEY, JSON.stringify({ profiles: ps }))
  }

  const createProfile = ({ nombre, emoji, pin }) => {
    const p = {
      id: uid(),
      nombre: nombre.trim(),
      emoji,
      pin: pin || null,
      createdAt: new Date().toISOString(),
    }
    persistProfiles([...profiles, p])
    return p
  }

  const updateProfile = (id, changes) => {
    persistProfiles(profiles.map(p => p.id === id ? { ...p, ...changes } : p))
  }

  const deleteProfile = (id) => {
    persistProfiles(profiles.filter(p => p.id !== id))
    localStorage.removeItem(`df-data-${id}`)
  }

  const login = (profile) => {
    setActiveProfile(profile)
    setMode(null) // siempre forzar selección de modo al hacer login
  }

  const logout = () => {
    setActiveProfile(null)
    setMode(null)
  }

  const switchMode = (m) => setMode(m)

  return (
    <AuthContext.Provider value={{
      profiles,
      activeProfile,
      mode,
      ready,
      createProfile,
      updateProfile,
      deleteProfile,
      login,
      logout,
      switchMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

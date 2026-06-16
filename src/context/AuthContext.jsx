import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

const modeKey = (uid) => `df-mode-${uid}`

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null)
  const [mfaPending, setMfaPending] = useState(false)
  const [mode, setMode]             = useState(null)
  const [ready, setReady]           = useState(false)

  const loadMode = useCallback((uid) => {
    setMode(localStorage.getItem(modeKey(uid)) || null)
  }, [])

  const checkMFA = useCallback(async () => {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
      setMfaPending(true)
      return true
    }
    setMfaPending(false)
    return false
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const needsMFA = await checkMFA()
        if (!needsMFA) loadMode(session.user.id)
      }
      setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const needsMFA = await checkMFA()
        if (!needsMFA) loadMode(session.user.id)
      } else {
        setUser(null)
        setMfaPending(false)
        setMode(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [checkMFA, loadMode])

  const signUp = async ({ email, password, nombre, emoji }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nombre: nombre.trim(), emoji: emoji || '🧑' } },
    })
    if (error) throw error
    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMode(null)
    setMfaPending(false)
  }

  const completeMFA = async (code) => {
    const { data: { totp } } = await supabase.auth.mfa.listFactors()
    if (!totp?.length) throw new Error('No hay factor 2FA configurado')
    const factorId = totp[0].id
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
    if (cErr) throw cErr
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    })
    if (vErr) throw vErr
    setMfaPending(false)
    if (user) loadMode(user.id)
  }

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) throw error
    return data
  }

  const confirmMFAEnroll = async (factorId, code) => {
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId })
    if (cErr) throw cErr
    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    })
    if (vErr) throw vErr
  }

  const unenrollMFA = async () => {
    const { data: { totp } } = await supabase.auth.mfa.listFactors()
    if (totp?.length) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: totp[0].id })
      if (error) throw error
    }
  }

  const hasMFA = async () => {
    const { data: { totp } } = await supabase.auth.mfa.listFactors()
    return (totp?.length ?? 0) > 0
  }

  const switchMode = (m) => {
    setMode(m)
    if (user) localStorage.setItem(modeKey(user.id), m)
  }

  const activeProfile = user
    ? {
        id: user.id,
        nombre: user.user_metadata?.nombre || user.email?.split('@')[0] || 'Usuario',
        emoji: user.user_metadata?.emoji || '🧑',
        email: user.email,
      }
    : null

  return (
    <AuthContext.Provider value={{
      user,
      activeProfile,
      mfaPending,
      mode,
      ready,
      signUp,
      signIn,
      signOut,
      completeMFA,
      enrollMFA,
      confirmMFAEnroll,
      unenrollMFA,
      hasMFA,
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

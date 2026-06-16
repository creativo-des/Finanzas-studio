import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const pageIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
}

export default function LoginPage({ onShowRegister }) {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      await signIn({ email, password })
    } catch (err) {
      const msg = err.message || 'Error al iniciar sesión'
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos')
      else if (msg.includes('Email not confirmed')) setError('Confirma tu email antes de entrar')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px)',
      overflowY: 'auto',
    }}>
      <motion.div {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(124,111,247,0.35)',
          }}>
            <span style={{ fontSize: '36px' }}>💜</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Finanzas Disegnarus
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Inicia sesión para continuar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoFocus
            />
          </div>

          <div>
            <label className="input-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: 'var(--text-muted)',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              fontSize: '13px', color: '#f87171',
            }}>
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 'var(--radius-lg)', border: 'none',
              background: (loading || !email.trim() || !password) ? 'var(--bg-surface-3)' : 'var(--accent)',
              color: (loading || !email.trim() || !password) ? 'var(--text-muted)' : 'white',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
              cursor: (loading || !email.trim() || !password) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}
          >
            <LogIn size={17} />
            {loading ? 'Entrando...' : 'Entrar'}
          </motion.button>
        </form>

        {/* Link a registro */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onShowRegister}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontWeight: 600, fontSize: '14px',
            }}
          >
            Créala aquí
          </motion.button>
        </p>

      </motion.div>

      <p style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 16px)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Disegnarus Studio · Cali, Colombia · 2025
      </p>
    </div>
  )
}

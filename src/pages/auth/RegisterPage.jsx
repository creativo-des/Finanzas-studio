import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const AVATARS = ['🧑','👨','👩','👦','👧','🧔','👱','🙋','😎','🤩','🦸','🧙‍♀️','🧑‍💻','🧑‍🎨','🧑‍💼','🐱']

const pageIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
}

export default function RegisterPage({ onShowLogin }) {
  const { signUp } = useAuth()
  const [step, setStep]         = useState(0) // 0=datos, 1=cuenta
  const [nombre, setNombre]     = useState('')
  const [emoji, setEmoji]       = useState('🧑')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  const handleRegister = async (e) => {
    e?.preventDefault()
    if (!email.trim() || password.length < 6) return
    setLoading(true)
    setError(null)
    try {
      await signUp({ email, password, nombre, emoji })
      setSuccess(true)
    } catch (err) {
      const msg = err.message || 'Error al crear cuenta'
      if (msg.includes('already registered')) setError('Este email ya está registrado')
      else if (msg.includes('Password should be at least')) setError('La contraseña debe tener al menos 6 caracteres')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        height: '100dvh', background: 'var(--bg-base)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center', gap: '20px',
      }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
          <CheckCircle size={64} color="var(--income)" />
        </motion.div>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ¡Cuenta creada!
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '300px' }}>
            Te enviamos un email de confirmación a <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Confírmalo y luego inicia sesión.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShowLogin}
          style={{
            padding: '14px 32px', borderRadius: 'var(--radius-lg)', border: 'none',
            background: 'var(--accent)', color: 'white',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
          }}
        >
          Ir a iniciar sesión
        </motion.button>
      </div>
    )
  }

  return (
    <div style={{
      height: '100dvh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px)',
      overflowY: 'auto',
    }}>
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div key="step0" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
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
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Crear cuenta
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Elige tu avatar y nombre</p>
            </div>

            {/* Avatar preview */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--accent-dim)', border: '2px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '44px', margin: '0 auto',
              }}>
                {emoji}
              </div>
            </div>

            {/* Emoji picker */}
            <div>
              <label className="input-label" style={{ marginBottom: '8px' }}>Avatar</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {AVATARS.map(av => (
                  <motion.button
                    key={av}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setEmoji(av)}
                    style={{
                      width: '44px', height: '44px', fontSize: '24px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${emoji === av ? 'var(--accent-border)' : 'var(--border)'}`,
                      background: emoji === av ? 'var(--accent-dim)' : 'var(--bg-surface-2)',
                      cursor: 'pointer',
                    }}
                  >
                    {av}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className="input-label">Nombre</label>
              <input
                className="input-field"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && nombre.trim() && setStep(1)}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(1)}
              disabled={!nombre.trim()}
              style={{
                width: '100%', padding: '15px', borderRadius: 'var(--radius-lg)', border: 'none',
                background: nombre.trim() ? 'var(--accent)' : 'var(--bg-surface-3)',
                color: nombre.trim() ? 'white' : 'var(--text-muted)',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
                cursor: nombre.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Continuar →
            </motion.button>

            <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              ¿Ya tienes cuenta?{' '}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onShowLogin}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}
              >
                Inicia sesión
              </motion.button>
            </p>
          </motion.div>
        ) : (
          <motion.div key="step1" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Header */}
            <div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setStep(0); setError(null) }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Volver
              </motion.button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <span style={{ fontSize: '32px' }}>{emoji}</span>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                    Hola, {nombre}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Crea tus credenciales de acceso</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                <label className="input-label">Contraseña (mín. 6 caracteres)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="new-password"
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
                disabled={loading || !email.trim() || password.length < 6}
                style={{
                  width: '100%', padding: '15px',
                  borderRadius: 'var(--radius-lg)', border: 'none',
                  background: (loading || !email.trim() || password.length < 6) ? 'var(--bg-surface-3)' : 'var(--accent)',
                  color: (loading || !email.trim() || password.length < 6) ? 'var(--text-muted)' : 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
                  cursor: (loading || !email.trim() || password.length < 6) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '4px',
                }}
              >
                <UserPlus size={17} />
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <p style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 16px)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Disegnarus Studio · Cali, Colombia · 2025
      </p>
    </div>
  )
}

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, CheckCircle, Camera, User, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRateLimit } from '../../hooks/useRateLimit'

const pageIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] } },
}

export default function RegisterPage({ onShowLogin }) {
  const { signUp, updateAvatar } = useAuth()
  const [step, setStep]         = useState(0)
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(false)

  const { isLocked, lockMessage, onFailure, onSuccess: onRlSuccess } = useRateLimit('register')

  // Foto de perfil
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleRegister = async (e) => {
    e?.preventDefault()
    if (!email.trim() || password.length < 6 || isLocked) return
    setLoading(true)
    setError(null)
    try {
      await signUp({ email, password, nombre, emoji: '🧑' })
      onRlSuccess()
      setSuccess(true)
    } catch (err) {
      onFailure()
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
          {photoFile && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px' }}>
              Puedes agregar tu foto desde Ajustes después de iniciar sesión.
            </p>
          )}
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

        {/* ── Paso 0: foto + nombre ── */}
        {step === 0 && (
          <motion.div key="step0" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(124,111,247,0.18), rgba(91,78,214,0.12))',
                border: '1px solid rgba(124,111,247,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <img src="/favicon.svg" alt="Disegnarus" style={{ width: '38px', height: '38px' }} />
              </div>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Crear cuenta
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Agrega tu nombre y una foto opcional</p>
            </div>

            {/* Foto de perfil */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handlePhotoClick}
                style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: photoPreview ? 'transparent' : 'var(--bg-surface-2)',
                  border: `2px ${photoPreview ? 'solid var(--accent-border)' : 'dashed rgba(255,255,255,0.15)'}`,
                  overflow: 'hidden', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexShrink: 0,
                }}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={38} color="rgba(255,255,255,0.18)" strokeWidth={1.4} />
                }
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '30px', background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Camera size={14} color="white" />
                </div>
              </motion.button>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>
                {photoPreview ? 'Toca para cambiar' : 'Foto de perfil (opcional)'}
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className="input-label">Tu nombre</label>
              <input
                className="input-field"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="¿Cómo te llamas?"
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
        )}

        {/* ── Paso 1: email + contraseña ── */}
        {step === 1 && (
          <motion.div key="step1" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setStep(0); setError(null) }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Volver
              </motion.button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
                {/* Mini avatar preview */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={22} color="var(--accent)" strokeWidth={1.8} />
                  }
                </div>
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

              {(lockMessage || error) && (
                <div style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  background: lockMessage ? 'rgba(245,183,49,0.1)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${lockMessage ? 'rgba(245,183,49,0.35)' : 'rgba(239,68,68,0.3)'}`,
                  fontSize: '13px', color: lockMessage ? '#f5b731' : '#f87171',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {lockMessage && <Lock size={13} />}
                  {lockMessage || error}
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading || !email.trim() || password.length < 6 || isLocked}
                style={{
                  width: '100%', padding: '15px',
                  borderRadius: 'var(--radius-lg)', border: 'none',
                  background: (loading || !email.trim() || password.length < 6 || isLocked) ? 'var(--bg-surface-3)' : 'var(--accent)',
                  color: (loading || !email.trim() || password.length < 6 || isLocked) ? 'var(--text-muted)' : 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
                  cursor: (loading || !email.trim() || password.length < 6 || isLocked) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  marginTop: '4px',
                }}
              >
                {isLocked ? <Lock size={17} /> : <UserPlus size={17} />}
                {loading ? 'Creando cuenta...' : isLocked ? 'Bloqueado' : 'Crear cuenta'}
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

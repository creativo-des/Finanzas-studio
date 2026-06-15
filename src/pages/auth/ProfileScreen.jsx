import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Plus, Trash2, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PINPad from '../../components/ui/PINPad'

const AVATARS = ['👨','👩','🧑','👦','👧','🧔','👱','🧒','🙋','🙆','🧑‍💻','🧑‍🎨','🧑‍💼','🧑‍🏫','😎','🤩','🥳','🦸','🧙','🐱']

const pageIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.32,0.72,0,1] } },
}

export default function ProfileScreen() {
  const { profiles, createProfile, deleteProfile, login } = useAuth()

  const [view, setView]       = useState('picker')  // 'picker' | 'create' | 'pin' | 'set-pin'
  const [pinTarget, setPinTarget] = useState(null)
  const [pin, setPin]         = useState('')
  const [pinError, setPinError] = useState(false)

  // Form creación
  const [nombre, setNombre]   = useState('')
  const [emoji, setEmoji]     = useState('🧑')
  const [newPin, setNewPin]   = useState('')
  const [step, setStep]       = useState(0) // 0=datos, 1=pin-opcional

  const resetCreate = () => {
    setNombre(''); setEmoji('🧑'); setNewPin(''); setStep(0)
    setView('picker')
  }

  const handleSelectProfile = (profile) => {
    if (profile.pin) {
      setPinTarget(profile)
      setPin('')
      setPinError(false)
      setView('pin')
    } else {
      login(profile)
    }
  }

  const handlePINChange = (val) => {
    setPin(val)
    setPinError(false)
    if (val.length === 4) {
      if (val === pinTarget.pin) {
        login(pinTarget)
      } else {
        setPinError(true)
        setTimeout(() => { setPin(''); setPinError(false) }, 700)
      }
    }
  }

  const handleCreateProfile = () => {
    const p = createProfile({ nombre, emoji, pin: newPin.length === 4 ? newPin : null })
    login(p)
  }

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'calc(env(safe-area-inset-top) + 32px) 24px calc(env(safe-area-inset-bottom) + 32px)',
      overflowY: 'auto',
    }}>

      <AnimatePresence mode="wait">

        {/* ── PICKER ───────────────────────────────────── */}
        {view === 'picker' && (
          <motion.div key="picker" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>

            {/* Logo / Branding */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {profiles.length === 0 ? 'Crea tu primer perfil para empezar' : '¿Quién eres?'}
              </p>
            </div>

            {/* Lista de perfiles */}
            {profiles.length > 0 && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {profiles.map(profile => (
                  <motion.div
                    key={profile.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectProfile(profile)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '16px 18px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'var(--accent-dim)',
                      border: '2px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '28px', flexShrink: 0,
                    }}>
                      {profile.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '17px', color: 'var(--text-primary)' }}>
                        {profile.nombre}
                      </p>
                      {profile.pin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Lock size={11} color="var(--text-muted)" />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PIN requerido</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Crear perfil */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setView('create')}
              style={{
                width: '100%', padding: '16px', borderRadius: 'var(--radius-xl)',
                border: '1.5px dashed var(--border-strong)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 500,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Plus size={18} color="var(--accent)" />
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Nuevo perfil</span>
            </motion.button>

          </motion.div>
        )}

        {/* ── CREAR PERFIL ─────────────────────────────── */}
        {view === 'create' && (
          <motion.div key="create" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={resetCreate}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Volver
              </motion.button>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)' }}>
                {step === 0 ? 'Crear perfil' : 'PIN de seguridad'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {step === 0 ? 'Elige tu avatar y nombre' : 'Opcional — protege tu perfil con un PIN de 4 dígitos'}
              </p>
            </div>

            {step === 0 && (
              <>
                {/* Avatar preview */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    background: 'var(--accent-dim)', border: '2px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', margin: '0 auto 16px',
                  }}>
                    {emoji}
                  </div>
                </div>

                {/* Emoji picker */}
                <div>
                  <label className="input-label" style={{ marginBottom: '8px' }}>Avatar</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
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
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    background: nombre.trim() ? 'var(--accent)' : 'var(--bg-surface-3)',
                    color: nombre.trim() ? 'white' : 'var(--text-muted)',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
                  }}
                >
                  Continuar →
                </motion.button>
              </>
            )}

            {step === 1 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '48px' }}>{emoji}</div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>{nombre}</p>
                </div>

                <PINPad value={newPin} onChange={setNewPin} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newPin.length === 4 ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCreateProfile}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                        border: 'none', background: 'var(--accent)', color: 'white',
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
                      }}
                    >
                      Crear perfil con PIN 🔒
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCreateProfile}
                      style={{
                        width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border)',
                        background: 'transparent', color: 'var(--text-secondary)',
                        fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '15px', cursor: 'pointer',
                      }}
                    >
                      Omitir PIN y crear perfil
                    </motion.button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── ENTRADA DE PIN ───────────────────────────── */}
        {view === 'pin' && pinTarget && (
          <motion.div key="pin" {...pageIn} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', marginBottom: '8px' }}>{pinTarget.emoji}</div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
                Hola, {pinTarget.nombre}
              </h2>
              <p style={{ fontSize: '14px', color: pinError ? 'var(--expense)' : 'var(--text-muted)', marginTop: '4px', transition: 'color 0.2s' }}>
                {pinError ? 'PIN incorrecto, intenta de nuevo' : 'Ingresa tu PIN de 4 dígitos'}
              </p>
            </div>

            <PINPad
              value={pin}
              onChange={handlePINChange}
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setView('picker'); setPin(''); setPinError(false) }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer' }}
            >
              ← Cambiar perfil
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Footer */}
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>
        Disegnarus Studio · Cali, Colombia · 2025
      </p>

    </div>
  )
}

import { motion } from 'framer-motion'
import { User, Briefcase, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MODES = [
  {
    key: 'personal',
    icon: User,
    title: 'Personal',
    desc: 'Gastos del hogar, presupuesto mensual, deudas y metas',
    gradient: 'linear-gradient(135deg, #7C6FF7 0%, #4F9EF8 100%)',
    glow: 'rgba(124,111,247,0.35)',
    emoji: '🏠',
  },
  {
    key: 'estudio',
    icon: Briefcase,
    title: 'Estudio',
    desc: 'Finanzas de Disegnarus Studio — ingresos, clientes y proyectos',
    gradient: 'linear-gradient(135deg, #2DD4A4 0%, #4F9EF8 100%)',
    glow: 'rgba(45,212,164,0.3)',
    emoji: '💼',
  },
]

const spring = { type: 'spring', stiffness: 300, damping: 24 }

export default function ModeSelector() {
  const { activeProfile, switchMode, logout } = useAuth()

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px)',
      gap: '32px',
    }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>
          {activeProfile?.emoji}
        </div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Hola, {activeProfile?.nombre}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          ¿Qué quieres ver hoy?
        </p>
      </motion.div>

      {/* Tarjetas de modo */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {MODES.map((mode, i) => {
          const Icon = mode.icon
          return (
            <motion.button
              key={mode.key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => switchMode(mode.key)}
              style={{
                width: '100%',
                padding: '24px 22px',
                borderRadius: 'var(--radius-xl)',
                border: 'none',
                background: mode.gradient,
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${mode.glow}`,
              }}
            >
              {/* Decoración */}
              <div style={{
                position: 'absolute', right: '-12px', top: '-12px',
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }} />
              <div style={{
                position: 'absolute', right: '18px', bottom: '-20px',
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={22} color="white" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '19px', color: 'white', marginBottom: '4px' }}>
                    {mode.title}
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, maxWidth: '220px' }}>
                    {mode.desc}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Cerrar sesión */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.96 }}
        onClick={logout}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <LogOut size={14} />
        Cambiar perfil
      </motion.button>

    </div>
  )
}

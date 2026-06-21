import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PERSONAL_TABS = [
  { to: '/',         icon: Home,           label: 'Inicio'   },
  { to: '/personal', icon: User,           label: 'Personal' },
  { to: '/tarjetas', icon: CreditCard,     label: 'Tarjetas' },
  { to: '/mas',      icon: MoreHorizontal, label: 'Más'      },
]

const ESTUDIO_TABS = [
  { to: '/',         icon: Home,           label: 'Inicio'   },
  { to: '/estudio',  icon: Building2,      label: 'Estudio'  },
  { to: '/tarjetas', icon: CreditCard,     label: 'Tarjetas' },
  { to: '/mas',      icon: MoreHorizontal, label: 'Más'      },
]

export default function TabBar() {
  const location = useLocation()
  const { mode, switchMode } = useAuth()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS

  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(false) }, [location.pathname])

  const close = () => setVisible(false)

  return (
    <>
      {/* Botón toggle — siempre visible, encima del overlay */}
      <motion.button
        className="mobile-tabbar"
        whileTap={{ scale: 0.84 }}
        onClick={() => setVisible(v => !v)}
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top) + 14px)',
          left: '14px',
          zIndex: 110,
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: visible ? 'rgba(124,111,247,0.22)' : 'rgba(10,10,20,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${visible ? 'rgba(124,111,247,0.45)' : 'rgba(255,255,255,0.10)'}`,
          boxShadow: '0 8px 28px rgba(0,0,0,0.50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {visible
            ? (
              <motion.span key="x"
                initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate:  60, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex' }}
              >
                <X size={18} color="var(--accent)" />
              </motion.span>
            ) : (
              <motion.span key="menu"
                initial={{ opacity: 0, rotate:  60, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                exit={{    opacity: 0, rotate: -60, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex' }}
              >
                <Menu size={18} color="rgba(255,255,255,0.65)" />
              </motion.span>
            )
          }
        </AnimatePresence>
      </motion.button>

      {/* Overlay pantalla completa */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(6,6,14,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              display: 'flex',
              flexDirection: 'column',
              paddingTop: 'calc(env(safe-area-inset-top) + 80px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
              paddingLeft: '28px',
              paddingRight: '28px',
            }}
          >
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '44px' }}
            >
              <img src="/favicon.svg" alt="Disegnarus" style={{ width: '34px', height: '34px' }} />
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}>
                Disegnarus
              </p>
            </motion.div>

            {/* Ítems de navegación */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {tabs.map(({ to, icon: Icon, label }, i) => {
                const isActive = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to)

                return (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + i * 0.055, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <NavLink to={to} onClick={close} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '18px',
                          padding: '15px 18px',
                          borderRadius: '16px',
                          background: isActive ? 'rgba(124,111,247,0.13)' : 'transparent',
                          border: `1px solid ${isActive ? 'rgba(124,111,247,0.28)' : 'transparent'}`,
                          transition: 'background 0.2s',
                        }}
                      >
                        <Icon
                          size={26}
                          color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.35)'}
                          strokeWidth={isActive ? 2.2 : 1.6}
                        />
                        <span style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontWeight: isActive ? 700 : 400,
                          fontSize: '22px',
                          color: isActive ? 'var(--text-primary)' : 'rgba(255,255,255,0.38)',
                          letterSpacing: '-0.01em',
                        }}>
                          {label}
                        </span>
                        {isActive && (
                          <div style={{
                            marginLeft: 'auto',
                            width: '7px', height: '7px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                          }} />
                        )}
                      </motion.div>
                    </NavLink>
                  </motion.div>
                )
              })}
            </nav>

            {/* Separador */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '20px 0' }} />

            {/* Switcher de perfil */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.2 }}
            >
              <p style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                fontWeight: 600, marginBottom: '10px',
              }}>
                Perfil activo
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { key: 'personal', emoji: '🏠', label: 'Personal' },
                  { key: 'estudio',  emoji: '💼', label: 'Estudio'  },
                ].map(m => {
                  const active = mode === m.key
                  return (
                    <motion.button
                      key={m.key}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => { switchMode(m.key); close() }}
                      style={{
                        flex: 1,
                        padding: '13px 12px',
                        borderRadius: '14px',
                        border: `1px solid ${active ? 'rgba(124,111,247,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        background: active ? 'rgba(124,111,247,0.16)' : 'rgba(255,255,255,0.03)',
                        color: active ? 'var(--accent)' : 'rgba(255,255,255,0.32)',
                        fontSize: '14px',
                        fontWeight: active ? 600 : 400,
                        fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{m.emoji}</span>
                      {m.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

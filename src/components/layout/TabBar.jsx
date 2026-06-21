import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PERSONAL_TABS = [
  { to: '/',         icon: Home           },
  { to: '/personal', icon: User           },
  { to: '/tarjetas', icon: CreditCard     },
  { to: '/mas',      icon: MoreHorizontal },
]

const ESTUDIO_TABS = [
  { to: '/',         icon: Home           },
  { to: '/estudio',  icon: Building2      },
  { to: '/tarjetas', icon: CreditCard     },
  { to: '/mas',      icon: MoreHorizontal },
]

const MODE_LABELS = {
  personal: { emoji: '🏠', label: 'Personal' },
  estudio:  { emoji: '💼', label: 'Estudio'  },
}

export default function TabBar() {
  const location = useLocation()
  const { mode, switchMode } = useAuth()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS

  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(false) }, [location.pathname])

  const close = () => setVisible(false)

  return (
    <div
      className="mobile-tabbar"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top) + 14px)',
        left: '14px',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
      }}
    >
      {/* Toggle */}
      <motion.button
        whileTap={{ scale: 0.84 }}
        onClick={() => setVisible(v => !v)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: visible ? 'rgba(124,111,247,0.20)' : 'rgba(10,10,20,0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${visible ? 'rgba(124,111,247,0.40)' : 'rgba(255,255,255,0.10)'}`,
          boxShadow: '0 8px 28px rgba(0,0,0,0.50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
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

      {/* Panel — se expande hacia abajo */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: -10, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{
              background: 'rgba(10,10,20,0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.60), 0 2px 10px rgba(0,0,0,0.30)',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              minWidth: '220px',
            }}
          >
            {/* Nav icons */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {tabs.map(({ to, icon: Icon }) => {
                const isActive = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to)

                return (
                  <NavLink key={to} to={to} onClick={close} style={{ textDecoration: 'none', flex: 1 }}>
                    <motion.div
                      whileTap={{ scale: 0.80 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(124,111,247,0.22)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <Icon
                        size={21}
                        color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.45)'}
                        strokeWidth={isActive ? 2.2 : 1.6}
                      />
                    </motion.div>
                  </NavLink>
                )
              })}
            </div>

            {/* Separador */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 4px' }} />

            {/* Switcher de perfil */}
            <div style={{ display: 'flex', gap: '4px', padding: '2px' }}>
              {(['personal', 'estudio']).map(m => {
                const { emoji, label } = MODE_LABELS[m]
                const active = mode === m
                return (
                  <motion.button
                    key={m}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => { switchMode(m); close() }}
                    style={{
                      flex: 1,
                      padding: '9px 8px',
                      borderRadius: '10px',
                      border: 'none',
                      background: active ? 'rgba(124,111,247,0.22)' : 'transparent',
                      color: active ? 'var(--accent)' : 'rgba(255,255,255,0.40)',
                      fontSize: '13px',
                      fontWeight: active ? 600 : 400,
                      fontFamily: 'Inter, sans-serif',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>{emoji}</span>
                    {label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

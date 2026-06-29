import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal, Menu, X, Target, DollarSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const PERSONAL_TABS = [
  { to: '/',         icon: Home,           label: 'Inicio'         },
  { to: '/personal', icon: User,           label: 'Personal'       },
  { to: '/metas',    icon: Target,         label: 'Metas de ahorro'},
  { to: '/deudas',   icon: DollarSign,     label: 'Deudas'         },
  { to: '/tarjetas', icon: CreditCard,     label: 'Tarjetas'       },
  { to: '/mas',      icon: MoreHorizontal, label: 'Más'            },
]

const ESTUDIO_TABS = [
  { to: '/',         icon: Home,           label: 'Inicio'         },
  { to: '/estudio',  icon: Building2,      label: 'Estudio'        },
  { to: '/mas',      icon: MoreHorizontal, label: 'Más'            },
]

export default function TabBar() {
  const location = useLocation()
  const { mode, switchMode, activeProfile } = useAuth()
  const { theme } = useTheme()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS
  const isDark = theme !== 'light'

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
          background: visible
            ? 'var(--accent-dim)'
            : isDark ? 'rgba(10,10,20,0.85)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${visible ? 'var(--accent-border)' : 'var(--border-strong)'}`,
          boxShadow: 'var(--shadow-md)',
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
                <Menu size={18} color="var(--text-secondary)" />
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
              background: isDark ? 'rgba(6,6,14,0.97)' : 'rgba(242,242,248,0.97)',
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
            {/* Brand / perfil usuario */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '44px' }}
            >
              {/* Avatar */}
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', border: '1.5px solid var(--accent-border)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {activeProfile?.avatar_url
                  ? <img src={activeProfile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : activeProfile?.emoji && activeProfile.emoji !== '🧑'
                    ? <span style={{ fontSize: '24px' }}>{activeProfile.emoji}</span>
                    : <User size={22} color="var(--accent)" strokeWidth={1.8} />
                }
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                  fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {activeProfile?.nombre || 'Usuario'}
                </p>
                {activeProfile?.email && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {activeProfile.email}
                  </p>
                )}
              </div>
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
                          color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                          strokeWidth={isActive ? 2.2 : 1.6}
                        />
                        <span style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontWeight: isActive ? 700 : 400,
                          fontSize: '22px',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
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
            <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />

            {/* Switcher de perfil */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.2 }}
            >
              <p style={{
                fontSize: '11px', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                fontWeight: 600, marginBottom: '10px',
              }}>
                Perfil activo
              </p>
              <div style={{
                display: 'flex',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '4px',
              }}>
                {[
                  { key: 'personal', emoji: '🏠', label: 'Personal' },
                  { key: 'estudio',  emoji: '💼', label: 'Estudio'  },
                ].map(m => {
                  const active = mode === m.key
                  return (
                    <motion.button
                      key={m.key}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { switchMode(m.key); close() }}
                      style={{
                        flex: 1,
                        position: 'relative',
                        padding: '14px 12px',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'transparent',
                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '15px',
                        fontWeight: active ? 700 : 400,
                        fontFamily: 'Space Grotesk, sans-serif',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        zIndex: 1,
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="mode-pill"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '14px',
                            background: 'var(--accent-dim)',
                            border: '1px solid var(--accent-border)',
                            zIndex: -1,
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span style={{ fontSize: '20px' }}>{m.emoji}</span>
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

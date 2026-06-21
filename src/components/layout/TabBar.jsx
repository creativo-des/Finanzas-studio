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

export default function TabBar() {
  const location = useLocation()
  const { mode } = useAuth()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS

  const [visible, setVisible] = useState(false)

  // Cierra el menú al cambiar de ruta
  useEffect(() => { setVisible(false) }, [location.pathname])

  return (
    <div
      className="mobile-tabbar"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top) + 14px)',
        left: '14px',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* Toggle — siempre visible en el extremo izquierdo */}
      <motion.button
        whileTap={{ scale: 0.84 }}
        onClick={() => setVisible(v => !v)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: visible
            ? 'rgba(124,111,247,0.20)'
            : 'rgba(10, 10, 20, 0.85)',
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

      {/* Nav pill — se expande hacia la derecha */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            key="nav"
            initial={{ opacity: 0, x: -14, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,   scale: 1    }}
            exit={{    opacity: 0, x: -14, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: 'rgba(10, 10, 20, 0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.30)',
              display: 'flex',
              alignItems: 'center',
              padding: '5px',
              gap: '2px',
            }}
          >
            {tabs.map(({ to, icon: Icon }) => {
              const isActive = to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)

              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setVisible(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    whileTap={{ scale: 0.80 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      width: '52px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '100px',
                      background: isActive ? 'rgba(124,111,247,0.22)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Icon
                      size={21}
                      color={isActive ? 'var(--accent)' : 'rgba(255,255,255,0.42)'}
                      strokeWidth={isActive ? 2.2 : 1.6}
                    />
                  </motion.div>
                </NavLink>
              )
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

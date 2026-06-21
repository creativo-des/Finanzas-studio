import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal, ChevronUp } from 'lucide-react'
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

  const [visible, setVisible] = useState(() => {
    const saved = localStorage.getItem('navVisible')
    return saved === null ? true : saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('navVisible', String(visible))
  }, [visible])

  return (
    <div
      className="mobile-tabbar"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top) + 14px)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      {/* Nav pill */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            key="nav"
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: 'rgba(10, 10, 20, 0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              gap: '2px',
            }}
          >
            {tabs.map(({ to, icon: Icon }) => {
              const isActive = to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)

              return (
                <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileTap={{ scale: 0.82 }}
                    transition={{ duration: 0.1 }}
                    style={{
                      width: '58px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '100px',
                      background: isActive ? 'rgba(124,111,247,0.22)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Icon
                      size={22}
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

      {/* Toggle — siempre visible */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setVisible(v => !v)}
        style={{
          background: 'rgba(10, 10, 20, 0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '100px',
          width: '48px',
          height: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
          padding: 0,
        }}
      >
        <motion.span
          animate={{ rotate: visible ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronUp size={13} color="rgba(255,255,255,0.50)" />
        </motion.span>
      </motion.button>
    </div>
  )
}

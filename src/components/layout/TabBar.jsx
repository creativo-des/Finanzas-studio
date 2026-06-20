import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PERSONAL_TABS = [
  { to: '/',         icon: Home,           },
  { to: '/personal', icon: User,           },
  { to: '/tarjetas', icon: CreditCard,     },
  { to: '/mas',      icon: MoreHorizontal, },
]

const ESTUDIO_TABS = [
  { to: '/',         icon: Home,           },
  { to: '/estudio',  icon: Building2,      },
  { to: '/tarjetas', icon: CreditCard,     },
  { to: '/mas',      icon: MoreHorizontal, },
]

export default function TabBar() {
  const location = useLocation()
  const { mode } = useAuth()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS

  return (
    <nav className="mobile-tabbar" style={{
      position: 'fixed',
      bottom: 'calc(20px + env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
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
      zIndex: 90,
    }}>
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
    </nav>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, User, Building2, CreditCard, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PERSONAL_TABS = [
  { to: '/',              icon: Home,           label: 'Home'     },
  { to: '/personal',      icon: User,           label: 'Personal' },
  { to: '/suscripciones', icon: CreditCard,     label: 'Subs'     },
  { to: '/mas',           icon: MoreHorizontal, label: 'Más'      },
]

const ESTUDIO_TABS = [
  { to: '/',              icon: Home,           label: 'Home'    },
  { to: '/estudio',       icon: Building2,      label: 'Estudio' },
  { to: '/suscripciones', icon: CreditCard,     label: 'Subs'    },
  { to: '/mas',           icon: MoreHorizontal, label: 'Más'     },
]

export default function TabBar() {
  const location = useLocation()
  const { mode } = useAuth()
  const tabs = mode === 'estudio' ? ESTUDIO_TABS : PERSONAL_TABS

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      height: 'calc(60px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: '8px',
      zIndex: 90,
    }}>
      {tabs.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to)

        return (
          <NavLink
            key={to}
            to={to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 4px',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            <motion.div
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
              style={{
                width: '40px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '11px',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <Icon
                size={18}
                color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </motion.div>
            <span style={{
              fontSize: '10px',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'Inter, sans-serif',
            }}>
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}

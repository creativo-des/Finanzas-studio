import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, User, Building2, CreditCard, TrendingDown,
  Target, Briefcase, Settings, LogOut, RefreshCw, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useFinance } from '../../context/FinanceContext'
import { useTheme } from '../../context/ThemeContext'

const NAV_PERSONAL = [
  { to: '/',              icon: Home,         label: 'Inicio'        },
  { to: '/personal',      icon: User,         label: 'Personal'      },
  { to: '/tarjetas',      icon: CreditCard,   label: 'Tarjetas'      },
  { to: '/deudas',        icon: TrendingDown, label: 'Deudas'        },
  { to: '/metas',         icon: Target,       label: 'Metas'         },
  { to: '/patrimonio',    icon: Briefcase,    label: 'Patrimonio'    },
  { to: '/ajustes',       icon: Settings,     label: 'Ajustes'       },
]

const NAV_ESTUDIO = [
  { to: '/',              icon: Home,         label: 'Inicio'        },
  { to: '/estudio',       icon: Building2,    label: 'Estudio'       },
  { to: '/mas',           icon: RefreshCw,    label: 'Sincronizar'   },
  { to: '/ajustes',       icon: Settings,     label: 'Ajustes'       },
]

export default function Sidebar() {
  const location   = useLocation()
  const { mode, switchMode, user, signOut } = useAuth()
  const { state }  = useFinance()
  const { theme, toggleTheme } = useTheme()
  const links      = mode === 'estudio' ? NAV_ESTUDIO : NAV_PERSONAL
  const appName    = state.config.nombre || 'Finanzas'

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '11px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>
            💜
          </div>
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1 }}>
              {appName}
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />

      {/* Mode switcher */}
      <div style={{ padding: '12px 10px' }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '3px',
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
                onClick={() => switchMode(m.key)}
                style={{
                  flex: 1,
                  position: 'relative',
                  padding: '8px 6px',
                  borderRadius: '9px',
                  border: 'none',
                  background: 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 400,
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  zIndex: 1,
                }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-mode-pill"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '9px',
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--accent-border)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span style={{ fontSize: '14px' }}>{m.emoji}</span>
                {m.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        {links.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
              >
                <Icon
                  size={18}
                  color={active ? 'var(--accent)' : 'var(--text-muted)'}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span style={{
                  fontSize: '14px', fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {label}
                </span>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />

      {/* User + logout */}
      <div style={{ padding: '14px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: 'var(--radius-md)',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: 'var(--accent)',
          }}>
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              title={theme === 'light' ? 'Cambiar a oscuro' : 'Cambiar a claro'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={signOut}
              title="Cerrar sesión"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </aside>
  )
}

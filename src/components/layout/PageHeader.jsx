import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'

export default function PageHeader({ title, subtitle, showBell = false, alertCount = 0, onBellClick, rightContent }) {
  return (
    <header className="page-header" style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '0 20px 12px',
      paddingTop: 'calc(env(safe-area-inset-top) + 14px)',
      flexShrink: 0,
      gap: '10px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && (
          <p className="label-uppercase" style={{ marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</p>
        )}
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '21px',
          color: 'var(--text-primary)',
          lineHeight: 1.25,
          wordBreak: 'break-word',
        }}>
          {title}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, paddingTop: '2px' }}>
        {rightContent}
        {showBell && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBellClick}
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Bell size={22} color="var(--text-secondary)" strokeWidth={1.8} />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: 'var(--expense)',
                borderRadius: '50%',
                border: '1.5px solid var(--bg-base)',
              }} />
            )}
          </motion.button>
        )}
      </div>
    </header>
  )
}

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'

export default function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top) + 16px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '380px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-strong)',
            borderLeft: `3px solid ${toast.type === 'success' ? 'var(--income)' : 'var(--expense)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 200,
          }}
        >
          {toast.type === 'success'
            ? <CheckCircle size={18} color="var(--income)" />
            : <AlertCircle size={18} color="var(--expense)" />
          }
          <span style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            {toast.message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

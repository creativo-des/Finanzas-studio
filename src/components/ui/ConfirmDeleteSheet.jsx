import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export default function ConfirmDeleteSheet({ open, onClose, itemName, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 200,
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340, mass: 0.7 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: '100%',
              maxWidth: '430px',
              background: 'var(--bg-surface-2)',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              borderTop: '1px solid var(--border-strong)',
              padding: '28px 20px calc(28px + env(safe-area-inset-bottom))',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--expense-dim)',
                  border: '1px solid rgba(240,107,107,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Trash2 size={22} color="var(--expense)" />
                </div>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}>
                  ¿Eliminar elemento?
                </p>
                {itemName && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                    fontStyle: 'italic',
                  }}>
                    "{itemName}"
                  </p>
                )}
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '15px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-3)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  style={{
                    flex: 1,
                    padding: '15px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--expense)',
                    color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

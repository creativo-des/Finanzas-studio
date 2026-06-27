import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const STORAGE_KEY = 'df-install-dismissed'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const autoTimer = useRef(null)

  useEffect(() => {
    const isIOS        = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const dismissed    = localStorage.getItem(STORAGE_KEY)
    if (isIOS && !isStandalone && !dismissed) {
      const t = setTimeout(() => {
        setShow(true)
        // Auto-cierra después de 5 segundos sin marcar como dismissed permanente
        autoTimer.current = setTimeout(() => setShow(false), 5000)
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [])

  const dismiss = () => {
    clearTimeout(autoTimer.current)
    setShow(false)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            bottom: 'calc(90px + env(safe-area-inset-bottom))',
            left: '16px',
            right: '16px',
            zIndex: 9999,
          }}
        >
          {/* Banner */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 14px 14px 16px',
            display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 2px 16px rgba(124,111,247,0.15)',
          }}>
            {/* Ícono */}
            <div style={{
              width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', flexShrink: 0,
            }}>
              📲
            </div>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Instala la app en tu iPhone
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                Toca{' '}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '18px', height: '18px', borderRadius: '4px',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  fontSize: '11px', color: 'var(--accent)', fontWeight: 700,
                  verticalAlign: 'middle', margin: '0 2px',
                }}>↑</span>{' '}
                y luego{' '}
                <strong style={{ color: 'var(--text-primary)' }}>"Añadir a inicio"</strong>
              </p>
            </div>

            {/* Cerrar */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={dismiss}
              style={{
                background: 'var(--bg-surface-3)', border: 'none', cursor: 'pointer',
                width: '28px', height: '28px', borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <X size={14} color="var(--text-muted)" />
            </motion.button>
          </div>

          {/* Flecha apuntando hacia abajo → al botón compartir de Safari */}
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            style={{
              textAlign: 'center', marginTop: '6px',
              fontSize: '16px', color: 'var(--accent)', lineHeight: 1,
            }}
          >
            ↓
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

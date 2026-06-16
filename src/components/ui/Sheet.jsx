import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Sheet({ open, onClose, title, children }) {
  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  )

  useEffect(() => {
    if (!open) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setVpHeight(vv.height)
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'var(--bg-overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Centrado wrapper */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 101,
              pointerEvents: 'none',
            }}
          >
            {/* Panel animado — flex column para header fijo + body scrollable */}
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
              style={{
                width: '100%',
                maxWidth: '430px',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                borderTop: '1px solid var(--border-strong)',
                maxHeight: `${vpHeight * 0.92}px`,
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'all',
              }}
            >
              {/* Drag handle — no scrollable */}
              <div style={{
                width: '36px',
                height: '4px',
                background: 'var(--border-strong)',
                borderRadius: '2px',
                margin: '12px auto 0',
                flexShrink: 0,
              }} />

              {/* Header — no scrollable */}
              {title && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px 0',
                  flexShrink: 0,
                }}>
                  <h2 style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: 'var(--text-primary)',
                  }}>
                    {title}
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-surface-3)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <X size={16} color="var(--text-muted)" />
                  </motion.button>
                </div>
              )}

              {/* Contenido scrollable */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorY: 'contain',
                padding: '20px',
                paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
              }}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

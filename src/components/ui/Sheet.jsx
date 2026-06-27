import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useIsDesktop } from '../../hooks/useIsDesktop'

export default function Sheet({ open, onClose, title, children }) {
  const isDesktop = useIsDesktop()
  const [vpHeight, setVpHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  )
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  useEffect(() => {
    if (!open || isDesktop) return
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0))
      setVpHeight(vv.height)
      setKeyboardOffset(kb)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open, isDesktop])

  // Reset keyboard offset when sheet closes
  useEffect(() => {
    if (!open) setKeyboardOffset(0)
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const closeBtn = (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClose}
      style={{
        width: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-surface-3)', border: 'none',
        borderRadius: 'var(--radius-full)', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <X size={16} color="var(--text-muted)" />
    </motion.button>
  )

  const withKeyboard = keyboardOffset > 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--bg-overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {isDesktop ? (
            /* ── Desktop: centered modal dialog ─────────────── */
            <div style={{
              position: 'fixed', inset: 0, zIndex: 101,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '40px',
              pointerEvents: 'none',
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ type: 'spring', damping: 30, stiffness: 380, mass: 0.7 }}
                style={{
                  width: '100%', maxWidth: '540px',
                  maxHeight: '88vh',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex', flexDirection: 'column',
                  overflow: 'hidden',
                  pointerEvents: 'all',
                }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                }}>
                  <h2 style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                    fontSize: '18px', color: 'var(--text-primary)',
                  }}>
                    {title || ''}
                  </h2>
                  {closeBtn}
                </div>

                {/* Body */}
                <div style={{
                  flex: 1, overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--bg-surface-3) transparent',
                  padding: '24px',
                }}>
                  {children}
                </div>
              </motion.div>
            </div>
          ) : (
            /* ── Mobile: bottom sheet que sube con el teclado ── */
            <div style={{
              position: 'fixed',
              left: 0, right: 0,
              bottom: keyboardOffset,
              display: 'flex', justifyContent: 'center',
              zIndex: 101, pointerEvents: 'none',
              transition: 'bottom 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <motion.div
                initial={{ y: '100%', opacity: 0.8 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.8 }}
                style={{
                  width: '100%', maxWidth: '430px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: withKeyboard
                    ? 'var(--radius-xl)'
                    : 'var(--radius-xl) var(--radius-xl) 0 0',
                  borderTop: '1px solid var(--border-strong)',
                  maxHeight: withKeyboard
                    ? `${vpHeight - 8}px`
                    : `${vpHeight * 0.92}px`,
                  display: 'flex', flexDirection: 'column',
                  pointerEvents: 'all',
                  transition: 'border-radius 0.28s ease, max-height 0.28s ease',
                }}
              >
                {/* Drag handle — solo esta zona arrastra el sheet */}
                {!withKeyboard && (
                  <motion.div
                    drag="y"
                    dragConstraints={{ top: 0 }}
                    dragElastic={{ top: 0, bottom: 0.4 }}
                    onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
                    style={{
                      padding: '12px 0 4px', flexShrink: 0,
                      display: 'flex', justifyContent: 'center',
                      cursor: 'grab', touchAction: 'none',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '4px',
                      background: 'var(--border-strong)', borderRadius: '2px',
                    }} />
                  </motion.div>
                )}

                {/* Header */}
                {title && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: withKeyboard ? '14px 20px' : '16px 20px 0',
                    borderBottom: withKeyboard ? '1px solid var(--border)' : 'none',
                    flexShrink: 0,
                  }}>
                    <h2 style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                      fontSize: '18px', color: 'var(--text-primary)',
                    }}>
                      {title}
                    </h2>
                    {closeBtn}
                  </div>
                )}

                {/* Body */}
                <div style={{
                  flex: 1, overflowY: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorY: 'contain',
                  padding: '20px',
                  paddingBottom: withKeyboard
                    ? '20px'
                    : 'calc(20px + env(safe-area-inset-bottom))',
                }}>
                  {children}
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

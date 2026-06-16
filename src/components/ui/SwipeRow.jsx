import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export default function SwipeRow({ children, onRequestDelete, style = {} }) {
  const [swiped, setSwiped] = useState(false)

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <AnimatePresence>
        {swiped && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSwiped(false)
              onRequestDelete?.()
            }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '80px',
              background: 'var(--expense)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
              zIndex: 0,
            }}
          >
            <Trash2 size={18} color="white" />
            <span style={{ fontSize: '10px', color: 'white', fontWeight: 600 }}>Eliminar</span>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        drag="x"
        dragConstraints={{ left: swiped ? -80 : 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) setSwiped(true)
          else setSwiped(false)
        }}
        animate={{ x: swiped ? -80 : 0 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

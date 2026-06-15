import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'

export default function FAB({ onClick, color = 'var(--accent)' }) {
  const keyboardHeight = useKeyboardHeight()

  const bottomVal = keyboardHeight > 0
    ? keyboardHeight + 16
    : 'calc(80px + 20px + env(safe-area-inset-bottom))'

  return (
    <motion.button
      initial={false}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      animate={{ bottom: bottomVal }}
      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: 'calc(80px + 20px + env(safe-area-inset-bottom))',
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-full)',
        background: color,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-accent)',
        zIndex: 80,
      }}
    >
      <Plus size={24} color="white" strokeWidth={2.5} />
    </motion.button>
  )
}

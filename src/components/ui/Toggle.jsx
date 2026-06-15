import { motion } from 'framer-motion'

export default function Toggle({ checked, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '44px',
        height: '26px',
        borderRadius: '13px',
        background: checked ? 'var(--accent)' : 'var(--bg-surface-3)',
        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        style={{
          position: 'absolute',
          top: '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </motion.div>
  )
}

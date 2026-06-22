import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '20px',
    }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '72px', height: '72px', borderRadius: '22px',
          background: 'linear-gradient(135deg, rgba(124,111,247,0.18), rgba(91,78,214,0.12))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(124,111,247,0.35)',
          border: '1px solid rgba(124,111,247,0.25)',
        }}
      >
        <img src="/favicon.svg" alt="App Finanzas" style={{ width: '44px', height: '44px' }} />
      </motion.div>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map(i => (
          <motion.div key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}
          />
        ))}
      </div>
    </div>
  )
}

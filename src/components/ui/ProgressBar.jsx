import { motion } from 'framer-motion'

export default function ProgressBar({ percent, size = 'sm', color }) {
  const clampedPercent = Math.min(100, Math.max(0, percent))

  const barColor = color || (
    clampedPercent < 70 ? 'var(--income)' :
    clampedPercent < 90 ? 'var(--warning)' :
    'var(--expense)'
  )

  const height = size === 'lg' ? '6px' : '4px'
  const radius = size === 'lg' ? '3px' : '2px'

  return (
    <div style={{
      width: '100%',
      height,
      background: 'var(--border-strong)',
      borderRadius: radius,
      overflow: 'hidden',
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedPercent}%` }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          height: '100%',
          borderRadius: radius,
          background: barColor,
        }}
      />
    </div>
  )
}

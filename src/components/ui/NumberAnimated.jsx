import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { formatCOP } from '../../utils/formatCurrency'

export default function NumberAnimated({ value, prefix = '', suffix = '', duration = 0.8, format = 'cop', style = {} }) {
  const count = useMotionValue(0)

  const display = useTransform(count, v => {
    if (format === 'cop') return (prefix || '') + formatCOP(Math.round(v)) + (suffix || '')
    if (format === 'percent') return (prefix || '') + Math.round(v) + '%' + (suffix || '')
    return (prefix || '') + Math.round(v) + (suffix || '')
  })

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' })
    return controls.stop
  }, [value, duration])

  return (
    <motion.span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {display}
    </motion.span>
  )
}

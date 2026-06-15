import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { nombreMesCorto } from '../../utils/dateHelpers'

const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12']

export default function MonthSelector({ mesActual, onSelect }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const idx = MESES.indexOf(mesActual)
    if (scrollRef.current && idx !== -1) {
      const pill = scrollRef.current.children[idx]
      if (pill) {
        pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [mesActual])

  return (
    <div
      ref={scrollRef}
      className="scroll-x"
      style={{ padding: '0 20px', gap: '8px' }}
    >
      {MESES.map(mes => {
        const active = mes === mesActual
        return (
          <motion.button
            key={mes}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(mes)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: active ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {nombreMesCorto(mes)}
          </motion.button>
        )
      })}
    </div>
  )
}

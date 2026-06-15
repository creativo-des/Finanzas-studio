import { motion } from 'framer-motion'
import { Delete } from 'lucide-react'

const KEYS = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  [null,'0','del'],
]

export default function PINPad({ value, onChange, maxLen = 4 }) {
  const handleKey = (k) => {
    if (k === 'del') {
      onChange(value.slice(0, -1))
    } else if (value.length < maxLen) {
      onChange(value + k)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      {/* Indicadores de dígitos */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {Array.from({ length: maxLen }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: value.length === i + 1 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.15 }}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: i < value.length ? 'var(--accent)' : 'var(--border-strong)',
              border: i < value.length ? 'none' : '2px solid var(--border-strong)',
              transition: 'background 0.15s',
            }}
          />
        ))}
      </div>

      {/* Teclado */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
        {KEYS.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {row.map((key, ki) => {
              if (key === null) return <div key={ki} style={{ width: '64px', height: '64px' }} />
              return (
                <motion.button
                  key={ki}
                  whileTap={{ scale: 0.88, backgroundColor: 'var(--bg-surface-3)' }}
                  onClick={() => handleKey(key)}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.1s',
                  }}
                >
                  {key === 'del'
                    ? <Delete size={20} color="var(--text-secondary)" />
                    : <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '22px', color: 'var(--text-primary)' }}>{key}</span>
                  }
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

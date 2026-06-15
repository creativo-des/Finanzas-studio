import { useState } from 'react'
import { formatAmountDisplay, parseAmount } from '../../utils/formatCurrency'

export default function AmountInput({ value, onChange, placeholder = '0', autoFocus = false }) {
  const [display, setDisplay] = useState(value ? formatAmountDisplay(String(value)) : '')

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    setDisplay(raw ? formatAmountDisplay(raw) : '')
    onChange(parseAmount(raw))
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--bg-surface-3)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--accent-border)'
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <span style={{
        padding: '14px 12px 14px 16px',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 600,
        fontSize: '24px',
        color: 'var(--text-muted)',
        borderRight: '1px solid var(--border)',
        lineHeight: 1,
      }}>
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          flex: 1,
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '24px',
          color: 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      />
    </div>
  )
}

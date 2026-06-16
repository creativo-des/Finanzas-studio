import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function TwoFactorPage() {
  const { completeMFA, signOut, activeProfile } = useAuth()
  const [code, setCode]     = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)
  const inputRefs           = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    setError(null)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every(d => d !== '')) submitCode(next.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      submitCode(pasted)
    }
  }

  const submitCode = async (fullCode) => {
    setLoading(true)
    setError(null)
    try {
      await completeMFA(fullCode)
    } catch (err) {
      const msg = err.message || 'Código incorrecto'
      if (msg.includes('Invalid TOTP code') || msg.includes('invalid')) {
        setError('Código incorrecto. Intenta de nuevo.')
      } else {
        setError(msg)
      }
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100dvh', background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      gap: '32px',
    }}>

      {/* Ícono */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          width: '72px', height: '72px', borderRadius: '22px',
          background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,111,247,0.35)',
        }}
      >
        <ShieldCheck size={36} color="white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{ textAlign: 'center', maxWidth: '320px' }}
      >
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Verificación 2FA
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Ingresa el código de 6 dígitos de tu app autenticadora
          {activeProfile?.email && (
            <span> para <strong style={{ color: 'var(--text-secondary)' }}>{activeProfile.email}</strong></span>
          )}
        </p>
      </motion.div>

      {/* Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        style={{ display: 'flex', gap: '10px' }}
        onPaste={handlePaste}
      >
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={el => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
            disabled={loading}
            style={{
              width: '44px', height: '56px',
              textAlign: 'center',
              fontSize: '24px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${error ? 'rgba(239,68,68,0.5)' : digit ? 'var(--accent-border)' : 'var(--border)'}`,
              background: digit ? 'var(--accent-dim)' : 'var(--bg-surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
              WebkitAppearance: 'none',
            }}
          />
        ))}
      </motion.div>

      {loading && (
        <p style={{ fontSize: '14px', color: 'var(--accent)' }}>Verificando...</p>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            fontSize: '13px', color: '#f87171', textAlign: 'center', maxWidth: '280px',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Sign out */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={signOut}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '6px',
          marginTop: '8px',
        }}
      >
        <LogOut size={14} />
        Cerrar sesión
      </motion.button>

      <p style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 16px)', fontSize: '11px', color: 'var(--text-muted)' }}>
        Disegnarus Studio · Cali, Colombia · 2025
      </p>
    </div>
  )
}

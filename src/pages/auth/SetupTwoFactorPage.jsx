import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, ShieldOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import PageLayout from '../../components/layout/PageLayout'
import PageHeader from '../../components/layout/PageHeader'

export default function SetupTwoFactorPage() {
  const navigate = useNavigate()
  const { enrollMFA, confirmMFAEnroll, unenrollMFA, hasMFA } = useAuth()

  const [view, setView]         = useState('checking') // checking | active | inactive | setup | success
  const [factorId, setFactorId] = useState(null)
  const [qrCode, setQrCode]     = useState(null)
  const [secret, setSecret]     = useState(null)
  const [code, setCode]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const inputRefs               = useRef([])

  useEffect(() => {
    hasMFA().then(active => setView(active ? 'active' : 'inactive'))
  }, [hasMFA])

  const startEnroll = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await enrollMFA()
      setFactorId(data.id)
      setQrCode(data.totp.qr_code)
      setSecret(data.totp.secret)
      setView('setup')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDigit = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    setError(null)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (next.every(d => d !== '')) confirmCode(next.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      confirmCode(pasted)
    }
  }

  const confirmCode = async (fullCode) => {
    setLoading(true)
    setError(null)
    try {
      await confirmMFAEnroll(factorId, fullCode)
      setView('success')
    } catch (err) {
      const msg = err.message || 'Código incorrecto'
      setError(msg.includes('Invalid') ? 'Código incorrecto. Intenta de nuevo.' : msg)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async () => {
    if (!window.confirm('¿Desactivar la verificación en dos pasos? Tu cuenta quedará menos protegida.')) return
    setLoading(true)
    try {
      await unenrollMFA()
      setView('inactive')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (view === 'checking') return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Verificando estado...
      </div>
    )

    if (view === 'active') return (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
          display: 'flex', alignItems: 'flex-start', gap: '14px',
        }}>
          <ShieldCheck size={28} color="var(--income)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--income)', marginBottom: '4px' }}>
              2FA activada
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Tu cuenta está protegida con verificación en dos pasos. Cada vez que inicies sesión necesitarás el código de tu app autenticadora.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '13px', color: '#f87171' }}>
            {error}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleUnenroll}
          disabled={loading}
          style={{
            padding: '14px', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239,68,68,0.3)',
            background: 'rgba(239,68,68,0.08)',
            color: '#f87171',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <ShieldOff size={16} />
          Desactivar 2FA
        </motion.button>
      </div>
    )

    if (view === 'inactive') return (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <ShieldOff size={28} color="var(--text-muted)" />
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
            2FA no activada
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Activa la verificación en dos pasos para proteger tu cuenta. Necesitarás instalar una app autenticadora (Google Authenticator, Authy, etc.).
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '13px', color: '#f87171' }}>
            {error}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={startEnroll}
          disabled={loading}
          style={{
            padding: '15px', borderRadius: 'var(--radius-lg)', border: 'none',
            background: loading ? 'var(--bg-surface-3)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : 'white',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <ShieldCheck size={16} />
          {loading ? 'Configurando...' : 'Activar 2FA'}
        </motion.button>
      </div>
    )

    if (view === 'setup') return (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Paso 1: Escanear QR */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Paso 1 — Escanea este QR
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Con Google Authenticator, Authy o cualquier app TOTP
          </p>
          {qrCode && (
            <div style={{ textAlign: 'center' }}>
              <div
                dangerouslySetInnerHTML={{ __html: qrCode }}
                style={{
                  display: 'inline-block',
                  background: 'white',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  maxWidth: '200px',
                }}
              />
            </div>
          )}
        </div>

        {/* Clave manual */}
        {secret && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>O ingresa esta clave manual:</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--accent)', letterSpacing: '2px', wordBreak: 'break-all' }}>
              {secret}
            </p>
          </div>
        )}

        {/* Paso 2: Confirmar código */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Paso 2 — Confirma el código
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Ingresa el código de 6 dígitos que aparece en tu app
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigit(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={loading}
                style={{
                  width: '40px', height: '50px',
                  textAlign: 'center',
                  fontSize: '22px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${error ? 'rgba(239,68,68,0.5)' : digit ? 'var(--accent-border)' : 'var(--border)'}`,
                  background: digit ? 'var(--accent-dim)' : 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            ))}
          </div>

          {loading && <p style={{ fontSize: '13px', color: 'var(--accent)', textAlign: 'center' }}>Verificando...</p>}
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '13px', color: '#f87171' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    )

    if (view === 'success') return (
      <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <CheckCircle size={64} color="var(--income)" />
        </motion.div>
        <div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            ¡2FA activada!
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
            A partir de ahora necesitarás el código de tu app autenticadora para iniciar sesión.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/ajustes')}
          style={{
            padding: '14px 32px', borderRadius: 'var(--radius-lg)', border: 'none',
            background: 'var(--accent)', color: 'white',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px', cursor: 'pointer',
          }}
        >
          Listo
        </motion.button>
      </div>
    )
  }

  return (
    <PageLayout header={
      <PageHeader
        title="Verificación en dos pasos"
        left={<motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/ajustes')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}><ArrowLeft size={22} color="var(--text-primary)" /></motion.button>}
      />
    }>
      {renderContent()}
    </PageLayout>
  )
}

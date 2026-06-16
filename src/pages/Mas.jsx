import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, TrendingUp, Settings, ChevronRight, DollarSign,
  LogOut, Copy, CheckCircle, AlertCircle, RefreshCw, Download, CreditCard,
} from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'

// ── Constantes ──────────────────────────────────────────────────────
const SYNC_PREFIX  = 'df-sync-'
const LAST_SYNC_KEY = 'df-last-sync'
const CODE_TTL_MS  = 48 * 3600 * 1000  // 48 horas
// Letras sin ambigüedad (sin 0/O, sin 1/I/L)
const CODE_CHARS   = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// ── Helpers ─────────────────────────────────────────────────────────
function generateCode() {
  return Array.from({ length: 8 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
}

function saveCodeData(code, data) {
  localStorage.setItem(SYNC_PREFIX + code, JSON.stringify({ data, ts: Date.now() }))
}

function loadCodeData(code) {
  try {
    const raw = localStorage.getItem(SYNC_PREFIX + code.toUpperCase().replace(/\s/g, ''))
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CODE_TTL_MS) {
      localStorage.removeItem(SYNC_PREFIX + code)
      return null
    }
    return data
  } catch { return null }
}

function tiempoDesde(isoString) {
  if (!isoString) return null
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'hace un momento'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `hace ${hrs} h`
  return `hace ${Math.floor(hrs / 24)} días`
}

function formatCode(code) {
  // Muestra como "ABCD EFGH"
  return code ? `${code.slice(0, 4)} ${code.slice(4)}` : ''
}

// ── Sección de sincronización ────────────────────────────────────────
function SyncSection({ estudio, dispatch }) {
  const [miCodigo, setMiCodigo]         = useState(() => localStorage.getItem('df-my-sync-code') || '')
  const [codigoInput, setCodigoInput]   = useState('')
  const [copied, setCopied]             = useState(false)
  const [importStatus, setImportStatus] = useState(null) // 'ok' | 'error' | 'expired'
  const [lastSync, setLastSync]         = useState(() => localStorage.getItem(LAST_SYNC_KEY))

  // Limpiar el código activo si ya expiró
  useEffect(() => {
    if (miCodigo) {
      const raw = localStorage.getItem(SYNC_PREFIX + miCodigo)
      if (!raw) { setMiCodigo(''); localStorage.removeItem('df-my-sync-code') }
      else {
        try {
          const { ts } = JSON.parse(raw)
          if (Date.now() - ts > CODE_TTL_MS) {
            setMiCodigo(''); localStorage.removeItem('df-my-sync-code')
          }
        } catch { setMiCodigo(''); localStorage.removeItem('df-my-sync-code') }
      }
    }
  }, [])

  const handleGenerar = () => {
    const code = generateCode()
    saveCodeData(code, estudio)
    setMiCodigo(code)
    localStorage.setItem('df-my-sync-code', code)
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(miCodigo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleImport = () => {
    const clean = codigoInput.toUpperCase().replace(/\s/g, '')
    if (clean.length !== 8) { setImportStatus('error'); return }
    const data = loadCodeData(clean)
    if (!data) {
      setImportStatus(clean.length === 8 ? 'expired' : 'error')
      return
    }
    dispatch({ type: ACTIONS.IMPORT_ESTUDIO, estudio: data })
    const now = new Date().toISOString()
    localStorage.setItem(LAST_SYNC_KEY, now)
    setLastSync(now)
    setImportStatus('ok')
    setCodigoInput('')
  }

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
    setCodigoInput(val)
    setImportStatus(null)
  }

  const synced = importStatus === 'ok'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Título sección */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RefreshCw size={13} color="#4F9EF8" />
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Sincronizar Estudio
        </p>
      </div>

      {/* Banner sincronizado */}
      <AnimatePresence>
        {(synced || lastSync) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(45,212,164,0.1)',
              border: '1px solid rgba(45,212,164,0.25)',
            }}
          >
            <CheckCircle size={14} color="#2DD4A4" />
            <p style={{ fontSize: '13px', color: '#2DD4A4', fontWeight: 500 }}>
              {synced ? 'Sincronizado correctamente ✓' : `Último sync ${tiempoDesde(lastSync)}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BLOQUE: Mi código ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Genera un código y compártelo con tu socia para sincronizar los datos del Estudio.
        </p>

        {miCodigo ? (
          <>
            {/* Código grande */}
            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tu código
              </p>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.18em',
              }}>
                {formatCode(miCodigo)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Válido 48 h · Solo en este dispositivo
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleCopy}
                style={{
                  flex: 1, padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: copied ? 'rgba(45,212,164,0.15)' : '#4F9EF8',
                  color: copied ? '#2DD4A4' : 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {copied ? <><CheckCircle size={14} /> Copiado</> : <><Copy size={14} /> Copiar código</>}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleGenerar}
                title="Generar nuevo código"
                style={{
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <RefreshCw size={16} />
              </motion.button>
            </div>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerar}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: '#4F9EF8',
              color: 'white',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Download size={16} /> Generar mi código
          </motion.button>
        )}
      </div>

      {/* ── BLOQUE: Importar código ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: importStatus === 'error' || importStatus === 'expired'
          ? '1px solid rgba(239,68,68,0.35)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'border-color 0.2s',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ingresa el código de tu socia para importar sus datos:
        </p>

        {/* Input de código */}
        <input
          value={formatCode(codigoInput)}
          onChange={handleInputChange}
          placeholder="AB CD  EF GH"
          maxLength={9}
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${importStatus === 'error' || importStatus === 'expired' ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
            background: 'var(--bg-surface-2)',
            color: 'var(--text-primary)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textAlign: 'center',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            textTransform: 'uppercase',
            transition: 'border-color 0.2s',
          }}
        />

        {/* Mensajes de estado */}
        <AnimatePresence mode="wait">
          {importStatus === 'error' && (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertCircle size={13} color="#EF4444" />
              <p style={{ fontSize: '12px', color: '#EF4444' }}>Código inválido. Debe tener 8 caracteres.</p>
            </motion.div>
          )}
          {importStatus === 'expired' && (
            <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertCircle size={13} color="#F5B731" />
              <p style={{ fontSize: '12px', color: '#F5B731' }}>Código no encontrado o expirado. Pide uno nuevo.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleImport}
          disabled={codigoInput.length < 8}
          style={{
            width: '100%', padding: '13px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: codigoInput.length === 8 ? 'var(--accent)' : 'var(--bg-surface-3)',
            color: codigoInput.length === 8 ? 'white' : 'var(--text-muted)',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
            cursor: codigoInput.length === 8 ? 'pointer' : 'not-allowed',
          }}
        >
          Sincronizar
        </motion.button>
      </div>

    </div>
  )
}

// ── Opciones de navegación ───────────────────────────────────────────
const opciones = [
  { label: 'Suscripciones',     icon: CreditCard, to: '/suscripciones', color: '#7C6FF7' },
  { label: 'Deudas y créditos', icon: DollarSign, to: '/deudas',        color: '#C084FC' },
  { label: 'Metas de ahorro',   icon: Target,     to: '/metas',         color: '#2DD4A4' },
  { label: 'Patrimonio neto',   icon: TrendingUp, to: '/patrimonio',    color: '#F5B731' },
  { label: 'Ajustes',           icon: Settings,   to: '/ajustes',       color: '#9898B8' },
]

// ── Página ───────────────────────────────────────────────────────────
export default function Mas() {
  const navigate = useNavigate()
  const { logout, activeProfile } = useAuth()
  const { state, dispatch } = useFinance()

  return (
    <PageLayout header={<PageHeader title="Más" />}>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Perfil activo */}
        {activeProfile && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--accent-dim)', border: '2px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', flexShrink: 0,
            }}>
              {activeProfile.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
                {activeProfile.nombre}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Perfil activo</p>
            </div>
          </div>
        )}

        {/* Opciones */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {opciones.map((op, i) => {
            const Icon = op.icon
            return (
              <motion.div
                key={op.to}
                whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
                onClick={() => navigate(op.to)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '16px',
                  cursor: 'pointer',
                  borderBottom: i < opciones.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '14px',
                }}
              >
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: op.color + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color={op.color} />
                </div>
                <span style={{ flex: 1, fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {op.label}
                </span>
                <ChevronRight size={18} color="var(--text-muted)" />
              </motion.div>
            )
          })}
        </div>

        {/* Sincronizar */}
        <SyncSection estudio={state.estudio} dispatch={dispatch} />

        {/* Cerrar sesión */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.06)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '40px', height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LogOut size={20} color="#EF4444" />
          </div>
          <span style={{ flex: 1, fontSize: '16px', fontWeight: 500, color: '#EF4444', textAlign: 'left' }}>
            Cerrar sesión
          </span>
        </motion.button>

      </div>
    </PageLayout>
  )
}

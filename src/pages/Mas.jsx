import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Settings, ChevronRight,
  LogOut, Copy, CheckCircle, AlertCircle, RefreshCw, Download, Loader,
} from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { supabase } from '../lib/supabase'
import { useIsDesktop } from '../hooks/useIsDesktop'

// ── Constantes ──────────────────────────────────────────────────────
const LAST_SYNC_KEY = 'df-last-sync'
const CODE_TTL_MS   = 48 * 3600 * 1000  // 48 horas
const CODE_CHARS    = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

// ── Helpers ─────────────────────────────────────────────────────────
function generateCode() {
  return Array.from({ length: 8 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
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
  return code ? `${code.slice(0, 4)} ${code.slice(4)}` : ''
}

// ── Sección de sincronización (Supabase) ────────────────────────────
function SyncSection({ estudio, dispatch }) {
  const [miCodigo, setMiCodigo]         = useState(() => localStorage.getItem('df-my-sync-code') || '')
  const [codigoInput, setCodigoInput]   = useState('')
  const [copied, setCopied]             = useState(false)
  const [importStatus, setImportStatus] = useState(null) // 'ok' | 'error' | 'expired' | 'netError'
  const [lastSync, setLastSync]         = useState(() => localStorage.getItem(LAST_SYNC_KEY))
  const [generating, setGenerating]     = useState(false)
  const [importing, setImporting]       = useState(false)
  const [generateError, setGenerateError] = useState(false)

  const handleGenerar = async () => {
    setGenerating(true)
    setGenerateError(false)
    const code = generateCode()
    const { error } = await supabase
      .from('sync_codes')
      .upsert({ code, data: estudio, created_at: new Date().toISOString() }, { onConflict: 'code' })
    setGenerating(false)
    if (error) {
      console.error('[Sync] Error guardando código:', error)
      setGenerateError(true)
      return
    }
    setMiCodigo(code)
    localStorage.setItem('df-my-sync-code', code)
    setCopied(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(miCodigo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleImport = async () => {
    const clean = codigoInput.toUpperCase().replace(/\s/g, '')
    if (clean.length !== 8) { setImportStatus('error'); return }
    setImporting(true)
    const { data, error } = await supabase
      .from('sync_codes')
      .select('data, created_at')
      .eq('code', clean)
      .single()
    setImporting(false)
    if (error) {
      setImportStatus(error.code === 'PGRST116' ? 'expired' : 'netError')
      return
    }
    if (!data || Date.now() - new Date(data.created_at).getTime() > CODE_TTL_MS) {
      setImportStatus('expired')
      return
    }
    dispatch({ type: ACTIONS.IMPORT_ESTUDIO, estudio: data.data })
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

      {/* Título */}
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
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'rgba(45,212,164,0.1)', border: '1px solid rgba(45,212,164,0.25)',
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
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Genera un código y compártelo con tu socia para sincronizar los datos del Estudio desde cualquier dispositivo.
        </p>

        {miCodigo ? (
          <>
            <div style={{
              background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '18px 16px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tu código
              </p>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', fontWeight: 700,
                color: 'var(--text-primary)', letterSpacing: '0.18em',
              }}>
                {formatCode(miCodigo)}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Válido 48 h · Guardado en la nube ☁️
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileTap={{ scale: 0.96 }} onClick={handleCopy}
                style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none',
                  background: copied ? 'rgba(45,212,164,0.15)' : '#4F9EF8',
                  color: copied ? '#2DD4A4' : 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {copied ? <><CheckCircle size={14} /> Copiado</> : <><Copy size={14} /> Copiar código</>}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }} onClick={handleGenerar} disabled={generating}
                title="Generar nuevo código"
                style={{
                  padding: '11px 14px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'var(--bg-surface-2)',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {generating
                  ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <RefreshCw size={16} />
                }
              </motion.button>
            </div>
          </>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={handleGenerar} disabled={generating}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: 'none',
              background: '#4F9EF8', color: 'white',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {generating
              ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
              : <><Download size={16} /> Generar mi código</>
            }
          </motion.button>
        )}

        <AnimatePresence>
          {generateError && (
            <motion.div
              key="gen-err"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <AlertCircle size={13} color="#EF4444" />
              <p style={{ fontSize: '12px', color: '#EF4444' }}>Error al guardar el código. Revisa tu conexión.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BLOQUE: Importar código ── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: importStatus === 'error' || importStatus === 'expired' || importStatus === 'netError'
          ? '1px solid rgba(239,68,68,0.35)'
          : '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        transition: 'border-color 0.2s',
      }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Ingresa el código de tu socia para importar sus datos desde cualquier dispositivo:
        </p>

        <input
          value={formatCode(codigoInput)}
          onChange={handleInputChange}
          placeholder="ABCD EFGH"
          maxLength={9}
          style={{
            padding: '14px 16px', borderRadius: 'var(--radius-md)',
            border: `1px solid ${importStatus === 'error' || importStatus === 'expired' ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
            background: 'var(--bg-surface-2)', color: 'var(--text-primary)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '26px', fontWeight: 700,
            letterSpacing: '0.18em', textAlign: 'center', outline: 'none',
            width: '100%', boxSizing: 'border-box', textTransform: 'uppercase',
            transition: 'border-color 0.2s',
          }}
        />

        <AnimatePresence mode="wait">
          {importStatus === 'error' && (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} color="#EF4444" />
              <p style={{ fontSize: '12px', color: '#EF4444' }}>Código inválido. Debe tener 8 caracteres.</p>
            </motion.div>
          )}
          {importStatus === 'expired' && (
            <motion.div key="exp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} color="#F5B731" />
              <p style={{ fontSize: '12px', color: '#F5B731' }}>Código no encontrado o expirado. Pide uno nuevo.</p>
            </motion.div>
          )}
          {importStatus === 'netError' && (
            <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={13} color="#EF4444" />
              <p style={{ fontSize: '12px', color: '#EF4444' }}>Error de conexión. Revisa tu internet.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleImport}
          disabled={codigoInput.length < 8 || importing}
          style={{
            width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
            background: codigoInput.length === 8 && !importing ? 'var(--accent)' : 'var(--bg-surface-3)',
            color: codigoInput.length === 8 && !importing ? 'white' : 'var(--text-muted)',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
            cursor: codigoInput.length === 8 && !importing ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {importing
            ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Buscando...</>
            : 'Sincronizar'
          }
        </motion.button>
      </div>

    </div>
  )
}

// ── Opciones de navegación ───────────────────────────────────────────
const opciones = [
  { label: 'Patrimonio neto', icon: TrendingUp, to: '/patrimonio',    color: '#F5B731' },
  { label: 'Ajustes',         icon: Settings,   to: '/ajustes',       color: '#9898B8' },
]

// ── Página ───────────────────────────────────────────────────────────
export default function Mas() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { state, dispatch } = useFinance()
  const isDesktop = useIsDesktop()

  return (
    <PageLayout header={<PageHeader title="Más" />}>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Opciones — solo en móvil (en escritorio están en el sidebar) */}
        {!isDesktop && (
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
        )}

        {/* Sincronizar */}
        <SyncSection estudio={state.estudio} dispatch={dispatch} />

        {/* Cerrar sesión */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={signOut}
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

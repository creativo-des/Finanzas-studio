import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { ACTIONS } from '../context/actions'
import { formatCOP } from '../utils/formatCurrency'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

// TEA → TMV: tasa mensual efectiva vencida
const teaToTmv = (tea) => Math.pow(1 + tea / 100, 1 / 12) - 1

// Mensualidad necesaria para acumular un monto con TMV en n meses
const calcMensualidad = (monto, tmv, meses) => {
  if (meses <= 0) return 0
  if (tmv <= 0) return monto / meses
  return monto * (tmv / (Math.pow(1 + tmv, meses) - 1))
}

const formatPct = (v) => `${(v * 100).toFixed(4)}%`

export default function Metas() {
  const { state, dispatch } = useFinance()
  const { mode } = useAuth()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  // Solo las metas del modo activo (metas sin modo asignado van a personal)
  const metas = state.personal.metas.filter(m => (m.modo ?? 'personal') === mode)

  const [addOpen, setAddOpen] = useState(false)
  const [abonoId, setAbonoId] = useState(null)
  const [abono, setAbono]     = useState(0)

  const [nombre,    setNombre]    = useState('')
  const [emoji,     setEmoji]     = useState('💰')
  const [metaTotal, setMetaTotal] = useState(0)
  const [meses,     setMeses]     = useState(12)
  const [tea,       setTea]       = useState(12) // Tasa Efectiva Anual (%)

  const tmv = teaToTmv(tea)

  const handleAbonar = () => {
    if (!abono || !abonoId) return
    dispatch({ type: ACTIONS.ABONAR_META, id: abonoId, monto: abono })
    haptic.success()
    showToast({ message: 'Abono registrado ✓' })
    setAbonoId(null); setAbono(0)
  }

  const handleAdd = () => {
    if (!nombre || !metaTotal) return
    const mensualidadNecesaria = Math.round(calcMensualidad(metaTotal, tmv, meses))
    dispatch({
      type: ACTIONS.ADD_META,
      payload: { nombre, emoji, metaTotal, mesesPlan: meses, tasaEA: tea, tasaMV: tmv, mensualidadNecesaria, modo },
    })
    haptic.success()
    showToast({ message: `Meta "${nombre}" creada ✓` })
    setAddOpen(false)
    setNombre(''); setMetaTotal(0); setMeses(12); setEmoji('💰'); setTea(12)
  }

  const handleDelete = (id, nombreMeta) => {
    dispatch({ type: ACTIONS.DELETE_META, id })
    haptic.light()
    showToast({ message: `"${nombreMeta}" eliminada`, type: 'error' })
  }

  const totalAhorrado = metas.reduce((s, m) => s + m.ahorroActual, 0)
  const totalMeta     = metas.reduce((s, m) => s + m.metaTotal, 0)

  const mensualidadPreview = metaTotal > 0 ? Math.round(calcMensualidad(metaTotal, tmv, meses)) : 0

  return (
    <PageLayout header={<PageHeader title="Metas de Ahorro" subtitle="Objetivos de ahorro" />}>

      {/* Resumen */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-surface), var(--income-dim))',
          border: '1px solid var(--income-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: '20px',
        }}>
          <p className="label-uppercase" style={{ marginBottom: '4px' }}>Ahorro en metas</p>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: 'var(--income)' }}>
            {formatCOP(totalAhorrado)}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            de {formatCOP(totalMeta)} objetivo total · {metas.length} meta{metas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lista de metas */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {metas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</p>
            <p>Crea tu primera meta de ahorro</p>
          </div>
        )}

        {metas.map(meta => {
          const pct       = meta.metaTotal > 0 ? Math.min(100, (meta.ahorroActual / meta.metaTotal) * 100) : 0
          const completada = pct >= 100
          // Recalcular TMV desde TEA almacenada (compatibilidad con metas antiguas)
          const rMeta = meta.tasaMV ?? (meta.tasaEA != null ? teaToTmv(meta.tasaEA) : (meta.tasaInteres ? meta.tasaInteres / 100 / 12 : 0))

          return (
            <div key={meta.id} style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${completada ? 'var(--income-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: 600 }}>{meta.emoji} {meta.nombre}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Meta: {formatCOP(meta.metaTotal)} · {meta.mesesPlan} meses
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span className={`badge ${completada ? 'badge-green' : 'badge-blue'}`}>{pct.toFixed(0)}%</span>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleDelete(meta.id, meta.nombre)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>

              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--income)', marginBottom: '4px' }}>
                {formatCOP(meta.ahorroActual)}
              </p>
              <ProgressBar percent={pct} color={completada ? 'var(--income)' : 'var(--accent)'} />

              {/* Tasas */}
              {rMeta > 0 && (
                <div style={{
                  display: 'flex', gap: '12px', marginTop: '10px',
                  padding: '8px 12px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TEA</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {meta.tasaEA != null ? `${meta.tasaEA}%` : `${((Math.pow(1 + rMeta, 12) - 1) * 100).toFixed(2)}%`}
                    </p>
                  </div>
                  <div style={{ width: '1px', background: 'var(--border)' }} />
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>TMV</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatPct(rMeta)}</p>
                  </div>
                </div>
              )}

              {completada ? (
                <p style={{ fontSize: '12px', color: 'var(--income)', marginTop: '10px', fontWeight: 600 }}>
                  ¡Meta completada! 🎉
                </p>
              ) : (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Mensualidad: {formatCOP(meta.mensualidadNecesaria)}
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setAbonoId(meta.id); setAbono(0) }}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-md)',
                        border: 'none', background: 'var(--income-dim)',
                        color: 'var(--income)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      + Abonar
                    </motion.button>
                  </div>
                  {meta.mensualidadNecesaria > 0 && meta.metaTotal > meta.ahorroActual && (() => {
                    const mesesRestantes = Math.ceil((meta.metaTotal - meta.ahorroActual) / meta.mensualidadNecesaria)
                    const fecha = new Date()
                    fecha.setMonth(fecha.getMonth() + mesesRestantes)
                    const fechaStr = fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                    return (
                      <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '6px' }}>
                        Completarás esta meta en {fechaStr}
                      </p>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setNombre(''); setMetaTotal(0); setMeses(12); setEmoji('💰'); setTea(12); setAddOpen(true) }}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--income-border)', background: 'var(--income-dim)',
            color: 'var(--income)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <Plus size={15} /> Nueva meta
        </motion.button>
      </div>

      {/* Sheet abono */}
      <Sheet open={!!abonoId} onClose={() => setAbonoId(null)} title="Registrar abono">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Monto del abono</label>
            <AmountInput value={abono} onChange={setAbono} autoFocus={!!abonoId} />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleAbonar}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--income)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Confirmar abono
          </motion.button>
        </div>
      </Sheet>

      {/* Sheet nueva meta */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Nueva meta">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input
                className="input-field"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                style={{ width: '60px', textAlign: 'center', fontSize: '24px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre</label>
              <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Vacaciones, auto..." />
            </div>
          </div>

          <div>
            <label className="input-label">Monto objetivo</label>
            <AmountInput value={metaTotal} onChange={setMetaTotal} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Plazo (meses)</label>
              <input
                className="input-field"
                type="number" min={1}
                value={meses}
                onChange={e => setMeses(Math.max(1, Number(e.target.value)))}
              />
            </div>
            <div>
              <label className="input-label">TEA (%)</label>
              <input
                className="input-field"
                type="number" step="0.1" min={0}
                value={tea}
                onChange={e => setTea(Math.max(0, Number(e.target.value)))}
                placeholder="Ej: 12"
              />
            </div>
          </div>

          {/* Info de tasas derivadas */}
          <div style={{
            display: 'flex', gap: '0',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}>
            <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TEA ingresada</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{tea}%</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TMV equivalente</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'Space Grotesk, sans-serif' }}>{formatPct(tmv)}</p>
            </div>
          </div>

          {/* Preview mensualidad */}
          {metaTotal > 0 && (
            <div style={{ background: 'var(--income-dim)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--income)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Mensualidad estimada
              </p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--income)' }}>
                {formatCOP(mensualidadPreview)}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--income)', marginTop: '4px', opacity: 0.75 }}>
                {meses} cuotas · TMV {formatPct(tmv)}
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            disabled={!nombre || !metaTotal}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: nombre && metaTotal ? 'var(--income)' : 'var(--bg-surface-3)',
              color: nombre && metaTotal ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Crear meta
          </motion.button>
        </div>
      </Sheet>

      <Toast toast={toast} />
    </PageLayout>
  )
}

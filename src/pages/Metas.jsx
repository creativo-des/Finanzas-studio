import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { formatCOP } from '../utils/formatCurrency'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import FAB from '../components/ui/FAB'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

export default function Metas() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()
  const metas = state.personal.metas

  const [addOpen, setAddOpen]   = useState(false)
  const [abonoId, setAbonoId]   = useState(null)
  const [abono, setAbono]       = useState(0)

  const [nombre, setNombre]       = useState('')
  const [emoji, setEmoji]         = useState('💰')
  const [metaTotal, setMetaTotal] = useState(0)
  const [meses, setMeses]         = useState(12)
  const [tasa, setTasa]           = useState(10)

  const handleAbonar = () => {
    if (!abono || !abonoId) return
    dispatch({ type: ACTIONS.ABONAR_META, id: abonoId, monto: abono })
    haptic.success()
    showToast({ message: 'Abono registrado ✓' })
    setAbonoId(null); setAbono(0)
  }

  const handleAdd = () => {
    if (!nombre || !metaTotal) return
    const r = tasa / 100 / 12
    const mensualidadNecesaria = r > 0
      ? metaTotal * (r / (Math.pow(1 + r, meses) - 1))
      : metaTotal / meses
    dispatch({
      type: ACTIONS.ADD_META,
      payload: { nombre, emoji, metaTotal, mesesPlan: meses, tasaInteres: tasa, mensualidadNecesaria: Math.round(mensualidadNecesaria) },
    })
    haptic.success()
    showToast({ message: `Meta "${nombre}" creada ✓` })
    setAddOpen(false)
    setNombre(''); setMetaTotal(0); setMeses(12); setEmoji('💰')
  }

  const handleDelete = (id, nombreMeta) => {
    dispatch({ type: ACTIONS.DELETE_META, id })
    haptic.light()
    showToast({ message: `"${nombreMeta}" eliminada`, type: 'error' })
  }

  const totalAhorrado = metas.reduce((s, m) => s + m.ahorroActual, 0)
  const totalMeta     = metas.reduce((s, m) => s + m.metaTotal, 0)

  return (
    <PageLayout header={<PageHeader title="Metas de Ahorro" />}>

      {/* Resumen */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-surface), rgba(45,212,164,0.08))',
          border: '1px solid rgba(45,212,164,0.2)',
          borderRadius: 'var(--radius-2xl)',
          padding: '20px',
        }}>
          <p className="label-uppercase" style={{ marginBottom: '4px' }}>Ahorro en metas</p>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: 'var(--income)' }}>
            {formatCOP(totalAhorrado)}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            de {formatCOP(totalMeta)} objetivo total
          </p>
        </div>
      </div>

      {/* Lista de metas */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {metas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</p>
            <p>Crea tu primera meta con el +</p>
          </div>
        ) : (
          metas.map(meta => {
            const pct = meta.metaTotal > 0 ? Math.min(100, (meta.ahorroActual / meta.metaTotal) * 100) : 0
            const completada = pct >= 100
            return (
              <div key={meta.id} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${completada ? 'rgba(45,212,164,0.3)' : 'var(--border)'}`,
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
          })
        )}
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
              <input className="input-field" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: '60px', textAlign: 'center', fontSize: '24px' }} />
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
              <label className="input-label">Meses</label>
              <input className="input-field" type="number" min={1} value={meses} onChange={e => setMeses(Math.max(1, Number(e.target.value)))} />
            </div>
            <div>
              <label className="input-label">Tasa anual (%)</label>
              <input className="input-field" type="number" step="0.5" min={0} value={tasa} onChange={e => setTasa(Math.max(0, Number(e.target.value)))} />
            </div>
          </div>

          {metaTotal > 0 && (
            <div style={{ background: 'var(--income-dim)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <p style={{ fontSize: '13px', color: 'var(--income)' }}>
                Mensualidad estimada:{' '}
                <strong>
                  {formatCOP(Math.round(
                    tasa > 0
                      ? metaTotal * ((tasa/100/12) / (Math.pow(1 + tasa/100/12, meses) - 1))
                      : metaTotal / meses
                  ))}
                </strong>
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
      <FAB onClick={() => { setNombre(''); setMetaTotal(0); setMeses(12); setEmoji('💰'); setAddOpen(true) }} color="var(--income)" />
    </PageLayout>
  )
}

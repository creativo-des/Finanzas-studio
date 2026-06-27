import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, CircleDollarSign } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { ACTIONS } from '../context/actions'
import { calcTotalDeudas, calcAmortizacion } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import ProgressBar from '../components/ui/ProgressBar'
import NumberAnimated from '../components/ui/NumberAnimated'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

const EMOJIS_DEUDA = ['🏦', '💻', '🚗', '🏠', '📱', '🎓', '🏥', '💳', '✈️', '🛠️']

// TEA → TMV: tasa mensual efectiva vencida
const teaToTmv = (tea) => Math.pow(1 + tea / 100, 1 / 12) - 1

// TEA → cuota mensual (fórmula de amortización con TMV)
const cuotaDesdeTea = (monto, tea, plazo) => {
  if (plazo <= 0 || monto <= 0) return 0
  const tmv = teaToTmv(tea)
  return calcAmortizacion(monto, tmv * 100, plazo)
}

const formatPct = (v) => `${(v * 100).toFixed(4)}%`

export default function Deudas() {
  const { state, dispatch } = useFinance()
  const { mode } = useAuth()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  // Solo las deudas del modo activo
  const deudas   = state.personal.deudas.filter(d => (d.modo ?? 'personal') === mode)
  const tarjetas = state.personal.tarjetas.filter(t => t.tipo === 'credito')
  const totalDeuda = calcTotalDeudas(deudas)

  // ── Add ──────────────────────────────────────────────────────
  const [addOpen, setAddOpen]             = useState(false)
  const [dEmoji, setDEmoji]               = useState('🏦')
  const [dTipo, setDTipo]                 = useState('')
  const [dDeudaInicial, setDDeudaInicial] = useState(0)
  const [dTea, setDTea]                   = useState(0)
  const [dPlazo, setDPlazo]               = useState(12)

  const dTmv       = teaToTmv(dTea)
  const dCuotaCalc = cuotaDesdeTea(dDeudaInicial, dTea, dPlazo)
  const dIntereses = Math.max(0, dCuotaCalc * dPlazo - dDeudaInicial)

  // ── Edit ─────────────────────────────────────────────────────
  const [editDeuda, setEditDeuda]             = useState(null)
  const [editEmoji, setEditEmoji]             = useState('🏦')
  const [editTipo, setEditTipo]               = useState('')
  const [editDeudaActual, setEditDeudaActual] = useState(0)
  const [editMensualidad, setEditMensualidad] = useState(0)

  // ── Pago ─────────────────────────────────────────────────────
  const [pagoDeuda, setPagoDeuda] = useState(null)
  const [montoPago, setMontoPago] = useState(0)

  // ── Simulador ────────────────────────────────────────────────
  const [simMonto, setSimMonto] = useState(0)
  const [simPlazo, setSimPlazo] = useState(12)
  const [simTea, setSimTea]     = useState(25)    // TEA en %

  const simTmv        = teaToTmv(simTea)
  const cuotaSim      = simMonto > 0 && simPlazo > 0 ? calcAmortizacion(simMonto, simTmv * 100, simPlazo) : 0
  const totalIntereses = Math.max(0, cuotaSim * simPlazo - simMonto)

  // ── Handlers ─────────────────────────────────────────────────
  const handleAddDeuda = () => {
    if (!dTipo.trim() || !dDeudaInicial) return
    dispatch({
      type: ACTIONS.ADD_DEUDA,
      payload: {
        tipo: dTipo.trim(),
        emoji: dEmoji,
        deudaInicial: dDeudaInicial,
        deudaActual: dDeudaInicial,
        mensualidad: Math.round(dCuotaCalc),
        tasaEA: dTea,
        tasaMV: dTmv,
        plazoMeses: dPlazo,
        completado: 0,
        modo,
      },
    })
    haptic.success()
    showToast({ message: 'Deuda registrada ✓' })
    setAddOpen(false)
    setDTipo(''); setDDeudaInicial(0); setDTea(0); setDPlazo(12); setDEmoji('🏦')
  }

  const openEdit = (d) => {
    setEditDeuda(d)
    setEditEmoji(d.emoji)
    setEditTipo(d.tipo)
    setEditDeudaActual(d.deudaActual)
    setEditMensualidad(d.mensualidad)
  }

  const handleUpdateDeuda = () => {
    if (!editTipo.trim()) return
    const completado = editDeuda.deudaInicial > 0
      ? Math.round(((editDeuda.deudaInicial - editDeudaActual) / editDeuda.deudaInicial) * 1000) / 10
      : 0
    dispatch({
      type: ACTIONS.UPDATE_DEUDA,
      id: editDeuda.id,
      payload: { tipo: editTipo.trim(), emoji: editEmoji, deudaActual: editDeudaActual, mensualidad: editMensualidad, completado },
    })
    haptic.success()
    showToast({ message: 'Deuda actualizada ✓' })
    setEditDeuda(null)
  }

  const handleDeleteDeuda = () => {
    dispatch({ type: ACTIONS.DELETE_DEUDA, id: editDeuda.id })
    haptic.light()
    showToast({ message: 'Deuda eliminada', type: 'error' })
    setEditDeuda(null)
  }

  const handlePago = () => {
    if (!montoPago || !pagoDeuda) return
    const nuevaDeuda = Math.max(0, pagoDeuda.deudaActual - montoPago)
    const completado = pagoDeuda.deudaInicial > 0
      ? Math.round(((pagoDeuda.deudaInicial - nuevaDeuda) / pagoDeuda.deudaInicial) * 1000) / 10
      : 100
    dispatch({
      type: ACTIONS.UPDATE_DEUDA,
      id: pagoDeuda.id,
      payload: { deudaActual: nuevaDeuda, completado },
    })
    haptic.success()
    showToast({ message: `Pago de ${formatCOP(montoPago)} registrado ✓` })
    setPagoDeuda(null); setMontoPago(0)
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <PageLayout header={<PageHeader title="Deudas" />}>

      {/* Hero deuda total */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-surface), rgba(192,132,252,0.08))',
          border: '1px solid rgba(192,132,252,0.25)',
          borderRadius: 'var(--radius-2xl)',
          padding: '24px 20px 20px',
        }}>
          <p className="label-uppercase" style={{ marginBottom: '8px' }}>Deuda total</p>
          <NumberAnimated
            value={totalDeuda}
            style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '40px',
              color: 'var(--debt)', display: 'block', marginBottom: '8px',
            }}
          />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {deudas.reduce((s, d) => s + d.mensualidad, 0) > 0
              ? `${formatCOP(deudas.reduce((s, d) => s + d.mensualidad, 0))} / mes en cuotas`
              : 'Sin cuotas mensuales'}
          </p>
        </div>
      </div>

      {/* Créditos */}
      <div style={{ padding: '0 20px 24px' }}>
        <p className="label-uppercase" style={{ marginBottom: '12px' }}>Créditos</p>

        {deudas.length === 0 && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>🏦</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sin créditos registrados</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deudas.map(d => {
            const pct    = d.deudaInicial > 0 ? 100 - (d.deudaActual / d.deudaInicial) * 100 : 0
            const pagada = d.deudaActual <= 0
            const rDeuda = d.tasaMV ?? (d.tasaEA != null ? teaToTmv(d.tasaEA) : null)

            return (
              <div key={d.id} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${pagada ? 'rgba(45,212,164,0.3)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{d.emoji} {d.tipo}</span>
                  <span className={`badge ${pagada ? 'badge-green' : 'badge-purple'}`}>
                    {pagada ? '¡Pagada!' : `${d.completado.toFixed(1)}% pagado`}
                  </span>
                </div>

                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px',
                  color: pagada ? 'var(--income)' : 'var(--debt)', marginBottom: '4px',
                }}>
                  {pagada ? '¡Sin deuda!' : formatCOP(d.deudaActual)}
                </p>

                {!pagada && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    de {formatCOP(d.deudaInicial)} · Cuota: {formatCOP(d.mensualidad)}/mes
                    {d.plazoMeses ? ` · ${d.plazoMeses} meses` : ''}
                  </p>
                )}

                {/* Tasas */}
                {rDeuda != null && rDeuda > 0 && (
                  <div style={{
                    display: 'flex', gap: '0', marginBottom: '10px',
                    background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                  }}>
                    <div style={{ flex: 1, padding: '7px 12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>TEA</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {d.tasaEA != null ? `${d.tasaEA}%` : `${((Math.pow(1 + rDeuda, 12) - 1) * 100).toFixed(2)}%`}
                      </p>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border)' }} />
                    <div style={{ flex: 1, padding: '7px 12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>TMV</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--debt)' }}>{formatPct(rDeuda)}</p>
                    </div>
                  </div>
                )}

                <ProgressBar percent={pct} color={pagada ? 'var(--income)' : 'var(--debt)'} />

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {!pagada && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setPagoDeuda(d); setMontoPago(d.mensualidad || 0) }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '9px 12px', borderRadius: 'var(--radius-md)', border: 'none',
                        background: 'var(--income-dim)', color: 'var(--income)',
                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      <CircleDollarSign size={13} /> Registrar pago
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEdit(d)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '9px 14px', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)', background: 'transparent',
                      color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Pencil size={12} /> Editar
                  </motion.button>
                </div>
              </div>
            )
          })}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setDTipo(''); setDDeudaInicial(0); setDTea(0); setDPlazo(12); setDEmoji('🏦'); setAddOpen(true) }}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
              border: '1px dashed rgba(240,107,107,0.35)', background: 'rgba(240,107,107,0.06)',
              color: 'var(--debt)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            <Plus size={15} /> Registrar deuda
          </motion.button>
        </div>
      </div>

      {/* Tarjetas de crédito */}
      {tarjetas.length > 0 && (
        <div style={{ padding: '0 20px 24px' }}>
          <p className="label-uppercase" style={{ marginBottom: '12px' }}>Tarjetas de crédito</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tarjetas.map(t => {
              const pct = t.limite > 0 ? (t.saldoActual / t.limite) * 100 : 0
              const overLimit = pct > 100
              return (
                <div key={t.id} style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${overLimit ? 'rgba(240,107,107,0.4)' : pct >= 80 ? 'rgba(245,183,49,0.3)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 500 }}>{t.nombre}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.banco} · Tasa: {t.tasa}%/mes</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: t.color }}>
                        {formatCOP(t.saldoActual)}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>de {formatCOP(t.limite)}</p>
                    </div>
                  </div>
                  <ProgressBar percent={Math.min(100, pct)} color={pct > 100 ? 'var(--expense)' : pct >= 80 ? 'var(--warning)' : undefined} />
                  {overLimit && (
                    <p style={{ fontSize: '11px', color: 'var(--expense)', marginTop: '6px', fontWeight: 600 }}>
                      ⚠️ Sobre el límite ({pct.toFixed(0)}% usado)
                    </p>
                  )}
                  {!overLimit && pct >= 80 && (
                    <p style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '6px' }}>
                      {pct.toFixed(0)}% del límite usado
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Simulador */}
      <div style={{ padding: '0 20px 24px' }}>
        <p className="label-uppercase" style={{ marginBottom: '12px' }}>Simular nuevo crédito</p>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '16px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="input-label">Monto ($)</label>
              <input className="input-field" type="number" inputMode="numeric" min={0}
                value={simMonto || ''} onChange={e => setSimMonto(Math.max(0, Number(e.target.value)))} placeholder="0" />
            </div>
            <div>
              <label className="input-label">Plazo (meses)</label>
              <input className="input-field" type="number" inputMode="numeric" min={1}
                value={simPlazo} onChange={e => setSimPlazo(Math.max(1, Number(e.target.value)))} />
            </div>
            <div>
              <label className="input-label">TEA (%)</label>
              <input className="input-field" type="number" inputMode="decimal" step="0.1" min={0}
                value={simTea} onChange={e => setSimTea(Math.max(0, Number(e.target.value)))} placeholder="25" />
            </div>
          </div>

          {/* TMV derivada */}
          <div style={{
            display: 'flex', gap: '0', marginBottom: '12px',
            background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', overflow: 'hidden',
          }}>
            <div style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>TEA</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{simTea}%</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>TMV</p>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--debt)', fontFamily: 'Space Grotesk, sans-serif' }}>{formatPct(simTmv)}</p>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-md)', padding: '14px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            opacity: simMonto > 0 ? 1 : 0.45,
          }}>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Cuota mensual</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--income)' }}>
                {simMonto > 0 ? formatCOP(Math.round(cuotaSim)) : '—'}
              </p>
            </div>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total intereses</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--expense)' }}>
                {simMonto > 0 ? formatCOP(Math.round(totalIntereses)) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet: nueva deuda */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Nueva deuda">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label className="input-label">Ícono</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOJIS_DEUDA.map(e => (
                <motion.button key={e} whileTap={{ scale: 0.9 }} onClick={() => setDEmoji(e)}
                  style={{
                    width: '40px', height: '40px', fontSize: '20px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${dEmoji === e ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: dEmoji === e ? 'var(--accent-dim)' : 'var(--bg-surface-3)', cursor: 'pointer',
                  }}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Tipo de crédito</label>
            <input className="input-field" value={dTipo} onChange={e => setDTipo(e.target.value)} placeholder="Crédito tecnología, hipotecario..." />
          </div>

          <div>
            <label className="input-label">Monto del crédito</label>
            <AmountInput value={dDeudaInicial} onChange={setDDeudaInicial} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">TEA (%)</label>
              <input className="input-field" type="number" step="0.1" min={0}
                value={dTea} onChange={e => setDTea(Math.max(0, Number(e.target.value)))} placeholder="Ej: 25" />
            </div>
            <div>
              <label className="input-label">Plazo (meses)</label>
              <input className="input-field" type="number" min={1}
                value={dPlazo} onChange={e => setDPlazo(Math.max(1, Number(e.target.value)))} />
            </div>
          </div>

          {/* TEA → TMV */}
          <div style={{
            display: 'flex', background: 'var(--bg-surface-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
          }}>
            <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TEA ingresada</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{dTea}%</p>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TMV equivalente</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--debt)', fontFamily: 'Space Grotesk, sans-serif' }}>{formatPct(dTmv)}</p>
            </div>
          </div>

          {/* Preview cuota */}
          {dDeudaInicial > 0 && (
            <div style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--debt)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '4px' }}>
                Cuota mensual estimada
              </p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--debt)' }}>
                {formatCOP(Math.round(dCuotaCalc))}
              </p>
              {dIntereses > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--debt)', marginTop: '4px', opacity: 0.75 }}>
                  Total intereses: {formatCOP(Math.round(dIntereses))} · TMV {formatPct(dTmv)}
                </p>
              )}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAddDeuda}
            disabled={!dTipo.trim() || !dDeudaInicial}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: dTipo.trim() && dDeudaInicial ? 'var(--debt)' : 'var(--bg-surface-3)',
              color: dTipo.trim() && dDeudaInicial ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Registrar deuda
          </motion.button>
        </div>
      </Sheet>

      {/* Sheet: editar deuda */}
      <Sheet open={!!editDeuda} onClose={() => setEditDeuda(null)} title="Editar deuda">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label className="input-label">Ícono</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOJIS_DEUDA.map(e => (
                <motion.button key={e} whileTap={{ scale: 0.9 }} onClick={() => setEditEmoji(e)}
                  style={{
                    width: '40px', height: '40px', fontSize: '20px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${editEmoji === e ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: editEmoji === e ? 'var(--accent-dim)' : 'var(--bg-surface-3)', cursor: 'pointer',
                  }}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Tipo de crédito</label>
            <input className="input-field" value={editTipo} onChange={e => setEditTipo(e.target.value)} />
          </div>

          {/* Tasas guardadas (informativo) */}
          {editDeuda?.tasaMV > 0 && (
            <div style={{
              display: 'flex', background: 'var(--bg-surface-2)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
            }}>
              <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TEA</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {editDeuda.tasaEA != null ? `${editDeuda.tasaEA}%` : '—'}
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }} />
              <div style={{ flex: 1, padding: '10px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>TMV</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--debt)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {formatPct(editDeuda.tasaMV)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="input-label">Saldo pendiente actual</label>
            <AmountInput value={editDeudaActual} onChange={setEditDeudaActual} />
          </div>

          <div>
            <label className="input-label">Cuota mensual</label>
            <AmountInput value={editMensualidad} onChange={setEditMensualidad} />
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={handleUpdateDeuda}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Guardar cambios
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteDeuda}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Eliminar deuda
          </motion.button>
        </div>
      </Sheet>

      {/* Sheet: registrar pago */}
      <Sheet open={!!pagoDeuda} onClose={() => { setPagoDeuda(null); setMontoPago(0) }} title="Registrar pago">
        {pagoDeuda && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{pagoDeuda.emoji} {pagoDeuda.tipo}</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--debt)' }}>
                {formatCOP(pagoDeuda.deudaActual)}
              </p>
            </div>
            <div>
              <label className="input-label">Monto del pago</label>
              <AmountInput value={montoPago} onChange={setMontoPago} autoFocus={!!pagoDeuda} />
            </div>
            {montoPago > 0 && (
              <div style={{ background: 'var(--income-dim)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--income)' }}>
                  Saldo restante: <strong>{formatCOP(Math.max(0, pagoDeuda.deudaActual - montoPago))}</strong>
                </p>
              </div>
            )}
            <motion.button whileTap={{ scale: 0.96 }} onClick={handlePago}
              disabled={!montoPago}
              style={{
                width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
                background: montoPago ? 'var(--income)' : 'var(--bg-surface-3)',
                color: montoPago ? 'white' : 'var(--text-muted)',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Confirmar pago
            </motion.button>
          </div>
        )}
      </Sheet>

      <Toast toast={toast} />
    </PageLayout>
  )
}

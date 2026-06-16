import { useState } from 'react'
import { motion } from 'framer-motion'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcTotalesEstudio } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { formatFecha, nombreMesCorto } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Sheet from '../components/ui/Sheet'
import SwipeRow from '../components/ui/SwipeRow'
import ConfirmDeleteSheet from '../components/ui/ConfirmDeleteSheet'
import AmountInput from '../components/ui/AmountInput'
import FAB from '../components/ui/FAB'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Pencil, Settings2, X as XIcon, Plus as PlusIcon } from 'lucide-react'

const TABS = ['Ingresos', 'Gastos', 'Reparto', 'Evolución']

function RepartoCard({ nombre, porcentaje, monto, color, label }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: `1px solid ${color}33`,
      borderRadius: 'var(--radius-lg)', padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</p>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>{nombre}</p>
        </div>
        <div style={{
          background: color + '22', border: `1px solid ${color}44`,
          borderRadius: 'var(--radius-full)', padding: '4px 10px',
          fontSize: '13px', fontWeight: 700, color,
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {porcentaje}%
        </div>
      </div>
      <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-full)', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ width: `${porcentaje}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
      </div>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color }}>
        {formatCOP(monto)}
      </p>
    </div>
  )
}

export default function Estudio() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()
  const { mesActual, anioActual } = state.config

  const [tab, setTab] = useState(0)

  // Confirmación de borrado
  const [confirmIngreso, setConfirmIngreso] = useState(null)
  const [confirmGasto, setConfirmGasto]     = useState(null)

  // Sheets add
  const [sheetIngreso, setSheetIngreso]           = useState(false)
  const [sheetGasto, setSheetGasto]               = useState(false)
  const [sheetDistribucion, setSheetDistribucion] = useState(false)
  const [sheetCategorias, setSheetCategorias]     = useState(false)

  // Edit
  const [editIngreso, setEditIngreso] = useState(null)
  const [editGasto, setEditGasto]     = useState(null)

  // Shared form state (ingreso)
  const [cliente, setCliente]   = useState('')
  const [servicio, setServicio] = useState('')
  const [montoI, setMontoI]     = useState(0)
  const [estado, setEstado]     = useState('cobrado')

  // Shared form state (gasto)
  const [conceptoG, setConceptoG]   = useState('')
  const [categoriaG, setCategoriaG] = useState('Software')
  const [montoG, setMontoG]         = useState(0)

  // Categorias
  const [nuevaCat, setNuevaCat]     = useState('')
  const [editCatIdx, setEditCatIdx] = useState(null)
  const [editCatVal, setEditCatVal] = useState('')

  // Distribucion
  const dist = state.estudio.distribucion || {
    diseniador1: { nombre: 'Tú',    porcentaje: 35 },
    diseniador2: { nombre: 'Socia', porcentaje: 35 },
    estudio:     { porcentaje: 30 },
  }
  const [d1Nombre, setD1Nombre] = useState(dist.diseniador1.nombre)
  const [d1Pct, setD1Pct]       = useState(dist.diseniador1.porcentaje)
  const [d2Nombre, setD2Nombre] = useState(dist.diseniador2.nombre)
  const [d2Pct, setD2Pct]       = useState(dist.diseniador2.porcentaje)
  const [estPct, setEstPct]     = useState(dist.estudio.porcentaje)

  const totalPct = Number(d1Pct) + Number(d2Pct) + Number(estPct)
  const pctOk    = totalPct === 100

  const totales = calcTotalesEstudio(state.estudio, mesActual, anioActual)

  // ── Handlers: Ingreso ────────────────────────────────────
  const openAddIngreso = () => {
    setCliente(''); setServicio(''); setMontoI(0); setEstado('cobrado')
    setSheetIngreso(true)
  }

  const handleAddIngreso = () => {
    if (!montoI) return
    dispatch({
      type: ACTIONS.ADD_INGRESO_ESTUDIO,
      payload: { cliente, servicio, monto: montoI, estado, mes: mesActual, anio: anioActual, fecha: new Date().toISOString() },
    })
    haptic.success()
    showToast({ message: 'Ingreso registrado ✓' })
    setSheetIngreso(false)
  }

  const openEditIngreso = (i) => {
    setEditIngreso(i)
    setCliente(i.cliente || '')
    setServicio(i.servicio || '')
    setMontoI(i.monto)
    setEstado(i.estado)
  }

  const handleUpdateIngreso = () => {
    dispatch({
      type: ACTIONS.UPDATE_INGRESO_ESTUDIO,
      id: editIngreso.id,
      payload: { cliente, servicio, monto: montoI, estado },
    })
    haptic.success()
    showToast({ message: 'Ingreso actualizado ✓' })
    setEditIngreso(null)
  }

  const handleDeleteIngreso = () => {
    dispatch({ type: ACTIONS.DELETE_INGRESO_ESTUDIO, id: editIngreso.id })
    haptic.light()
    showToast({ message: 'Ingreso eliminado', type: 'error' })
    setEditIngreso(null)
  }

  // ── Handlers: Gasto ──────────────────────────────────────
  const openAddGasto = () => {
    setConceptoG(''); setCategoriaG(state.estudio.categorias[0] || 'Software'); setMontoG(0)
    setSheetGasto(true)
  }

  const handleAddGasto = () => {
    if (!montoG) return
    dispatch({
      type: ACTIONS.ADD_GASTO_ESTUDIO,
      payload: { concepto: conceptoG, categoria: categoriaG, monto: montoG, mes: mesActual, anio: anioActual, fecha: new Date().toISOString(), metodo: 'Transferencia' },
    })
    haptic.success()
    showToast({ message: 'Gasto registrado ✓' })
    setSheetGasto(false)
  }

  const openEditGasto = (g) => {
    setEditGasto(g)
    setConceptoG(g.concepto || '')
    setCategoriaG(g.categoria || state.estudio.categorias[0] || 'Software')
    setMontoG(g.monto)
  }

  const handleUpdateGasto = () => {
    dispatch({
      type: ACTIONS.UPDATE_GASTO_ESTUDIO,
      id: editGasto.id,
      payload: { concepto: conceptoG, categoria: categoriaG, monto: montoG },
    })
    haptic.success()
    showToast({ message: 'Gasto actualizado ✓' })
    setEditGasto(null)
  }

  const handleDeleteGasto = () => {
    dispatch({ type: ACTIONS.DELETE_GASTO_ESTUDIO, id: editGasto.id })
    haptic.light()
    showToast({ message: 'Gasto eliminado', type: 'error' })
    setEditGasto(null)
  }

  // ── Distribucion ─────────────────────────────────────────
  const handleSaveDistribucion = () => {
    dispatch({
      type: ACTIONS.SET_DISTRIBUCION_ESTUDIO,
      distribucion: {
        diseniador1: { nombre: d1Nombre, porcentaje: Number(d1Pct) },
        diseniador2: { nombre: d2Nombre, porcentaje: Number(d2Pct) },
        estudio:     { porcentaje: Number(estPct) },
      },
    })
    showToast({ message: 'Reparto guardado ✓' })
    setSheetDistribucion(false)
  }

  // Chart data
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const mes = String(i + 1).padStart(2, '0')
    const t   = calcTotalesEstudio(state.estudio, mes, anioActual)
    return { name: nombreMesCorto(mes), cobrado: t.cobrado, gastos: t.totalGastos }
  })

  const ingresosDelMes = state.estudio.ingresos
    .filter(i => i.mes === mesActual && i.anio === anioActual)
    .slice().sort((a, b) => b.monto - a.monto)

  const gastosDelMes = state.estudio.gastos
    .filter(g => g.mes === mesActual && g.anio === anioActual)
    .slice().sort((a, b) => b.monto - a.monto)

  // Reparto (largest-remainder to avoid rounding issues)
  const totalCobrado = totales.cobrado
  const rawD1  = totalCobrado * dist.diseniador1.porcentaje / 100
  const rawD2  = totalCobrado * dist.diseniador2.porcentaje / 100
  const rawEst = totalCobrado - rawD1 - rawD2
  const montoD1  = Math.round(rawD1)
  const montoD2  = Math.round(rawD2)
  const montoEst = Math.round(rawEst)

  return (
    <PageLayout header={<PageHeader title="Disegnarus Studio" subtitle="Finanzas del Estudio" />}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 20px 16px' }}>
        {[
          { label: 'Cobrado',   value: totales.cobrado,     color: 'var(--income)'  },
          { label: 'Pendiente', value: totales.pendiente,   color: 'var(--warning)' },
          { label: 'Gastos',    value: totales.totalGastos, color: 'var(--expense)' },
          { label: 'Utilidad',  value: totales.utilidad,    color: totales.utilidad >= 0 ? 'var(--income)' : 'var(--expense)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)', padding: '14px 16px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '6px' }}>{kpi.label}</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', color: kpi.color, fontVariantNumeric: 'tabular-nums' }}>
              {formatCOP(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="scroll-x" style={{ padding: '0 20px 16px', gap: '8px' }}>
        {TABS.map((t, i) => (
          <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setTab(i)}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              border: `1px solid ${tab === i ? 'var(--accent-border)' : 'var(--border)'}`,
              background: tab === i ? 'var(--accent-dim)' : 'transparent',
              color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: tab === i ? 600 : 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
            }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* ── TAB: Ingresos ───────────── */}
      {tab === 0 && (
        <div style={{ padding: '0 20px' }}>
          {ingresosDelMes.length === 0 ? (
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center',
            }}>
              <p style={{ fontSize: '32px', marginBottom: '8px' }}>💼</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Registra tu primer ingreso del mes</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={openAddIngreso}
                style={{ marginTop: '16px', padding: '12px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
              >
                + Agregar ingreso
              </motion.button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ingresosDelMes.map(i => (
                <SwipeRow
                  key={i.id}
                  onRequestDelete={() => setConfirmIngreso(i)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div
                    onClick={() => openEditIngreso(i)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 500 }}>{i.cliente || 'Sin cliente'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.servicio} · {formatFecha(i.fecha)}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--income)' }}>
                        {formatCOP(i.monto)}
                      </p>
                      <span className={`badge ${i.estado === 'cobrado' ? 'badge-green' : i.estado === 'pendiente' ? 'badge-amber' : 'badge-purple'}`}>
                        {i.estado}
                      </span>
                    </div>
                  </div>
                </SwipeRow>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Gastos ─────────────── */}
      {tab === 1 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setSheetCategorias(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Settings2 size={12} /> Categorías
            </motion.button>
          </div>

          {gastosDelMes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p>Sin gastos este mes</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {gastosDelMes.map(g => (
                <SwipeRow
                  key={g.id}
                  onRequestDelete={() => setConfirmGasto(g)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                  }}
                >
                  <div
                    onClick={() => openEditGasto(g)}
                    style={{
                      padding: '14px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 500 }}>{g.concepto || 'Sin concepto'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{g.categoria} · {formatFecha(g.fecha)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--expense)' }}>
                        -{formatCOP(g.monto)}
                      </p>
                      <Pencil size={12} color="var(--text-muted)" />
                    </div>
                  </div>
                </SwipeRow>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Reparto ────────────── */}
      {tab === 2 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="label-uppercase">Reparto de ingresos</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Basado en lo cobrado este mes</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                setD1Nombre(dist.diseniador1.nombre); setD1Pct(dist.diseniador1.porcentaje)
                setD2Nombre(dist.diseniador2.nombre); setD2Pct(dist.diseniador2.porcentaje)
                setEstPct(dist.estudio.porcentaje)
                setSheetDistribucion(true)
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Pencil size={12} /> Editar %
            </motion.button>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(79,158,248,0.12) 0%, rgba(45,212,164,0.08) 100%)',
            border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total cobrado este mes</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>
              {formatCOP(totales.cobrado)}
            </p>
          </div>

          {totales.cobrado === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Registra ingresos cobrados para ver la distribución.
            </p>
          )}

          <RepartoCard label="Diseñador 1" nombre={dist.diseniador1.nombre} porcentaje={dist.diseniador1.porcentaje} monto={montoD1} color="#7C6FF7" />
          <RepartoCard label="Diseñador 2" nombre={dist.diseniador2.nombre} porcentaje={dist.diseniador2.porcentaje} monto={montoD2} color="var(--accent)" />
          <RepartoCard label="Estudio" nombre="Disegnarus Studio" porcentaje={dist.estudio.porcentaje} monto={montoEst} color="var(--income)" />
        </div>
      )}

      {/* ── TAB: Evolución ──────────── */}
      {tab === 3 && (
        <div style={{ padding: '0 20px' }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '16px' }}>Ingresos vs Gastos {anioActual}</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--income)"  stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--income)"  stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--expense)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--expense)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                  formatter={v => formatCOP(v)}
                />
                <Area type="monotone" dataKey="cobrado" stroke="var(--income)"  strokeWidth={2} fill="url(#colorCobrado)" name="Cobrado" />
                <Area type="monotone" dataKey="gastos"  stroke="var(--expense)" strokeWidth={2} fill="url(#colorGastos)"  name="Gastos"  />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Sheet: agregar ingreso ────── */}
      <Sheet open={sheetIngreso} onClose={() => setSheetIngreso(false)} title="Nuevo ingreso">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label className="input-label">Cliente</label>
            <input className="input-field" value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente" />
          </div>
          <div><label className="input-label">Servicio</label>
            <input className="input-field" value={servicio} onChange={e => setServicio(e.target.value)} placeholder="Diseño logo, web..." />
          </div>
          <div><label className="input-label">Monto</label>
            <AmountInput value={montoI} onChange={setMontoI} />
          </div>
          <div>
            <label className="input-label">Estado</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['cobrado','pendiente','parcial'].map(e => (
                <motion.button key={e} whileTap={{ scale: 0.95 }} onClick={() => setEstado(e)}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${estado === e ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: estado === e ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                    color: estado === e ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: estado === e ? 600 : 400,
                    cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif',
                  }}
                >{e}</motion.button>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleAddIngreso}
            disabled={!montoI}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: montoI ? 'var(--accent)' : 'var(--bg-surface-3)', color: montoI ? 'white' : 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Registrar ingreso
          </motion.button>
        </div>
      </Sheet>

      {/* ── Sheet: editar ingreso ────── */}
      <Sheet open={!!editIngreso} onClose={() => setEditIngreso(null)} title="Editar ingreso">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label className="input-label">Cliente</label>
            <input className="input-field" value={cliente} onChange={e => setCliente(e.target.value)} />
          </div>
          <div><label className="input-label">Servicio</label>
            <input className="input-field" value={servicio} onChange={e => setServicio(e.target.value)} />
          </div>
          <div><label className="input-label">Monto</label>
            <AmountInput value={montoI} onChange={setMontoI} />
          </div>
          <div>
            <label className="input-label">Estado</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['cobrado','pendiente','parcial'].map(e => (
                <motion.button key={e} whileTap={{ scale: 0.95 }} onClick={() => setEstado(e)}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${estado === e ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: estado === e ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                    color: estado === e ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: estado === e ? 600 : 400,
                    cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif',
                  }}
                >{e}</motion.button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteIngreso}
              style={{ flex: '0 0 auto', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleUpdateIngreso}
              style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Guardar cambios
            </motion.button>
          </div>
        </div>
      </Sheet>

      {/* ── Sheet: agregar gasto ─────── */}
      <Sheet open={sheetGasto} onClose={() => setSheetGasto(false)} title="Nuevo gasto del estudio">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label className="input-label">Concepto</label>
            <input className="input-field" value={conceptoG} onChange={e => setConceptoG(e.target.value)} placeholder="Describe el gasto..." />
          </div>
          <div><label className="input-label">Categoría</label>
            <select className="input-field" value={categoriaG} onChange={e => setCategoriaG(e.target.value)}>
              {state.estudio.categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="input-label">Monto</label>
            <AmountInput value={montoG} onChange={setMontoG} />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleAddGasto}
            disabled={!montoG}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: montoG ? 'var(--accent)' : 'var(--bg-surface-3)', color: montoG ? 'white' : 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Registrar gasto
          </motion.button>
        </div>
      </Sheet>

      {/* ── Sheet: editar gasto ──────── */}
      <Sheet open={!!editGasto} onClose={() => setEditGasto(null)} title="Editar gasto">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label className="input-label">Concepto</label>
            <input className="input-field" value={conceptoG} onChange={e => setConceptoG(e.target.value)} />
          </div>
          <div><label className="input-label">Categoría</label>
            <select className="input-field" value={categoriaG} onChange={e => setCategoriaG(e.target.value)}>
              {state.estudio.categorias.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="input-label">Monto</label>
            <AmountInput value={montoG} onChange={setMontoG} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteGasto}
              style={{ flex: '0 0 auto', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleUpdateGasto}
              style={{ flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Guardar cambios
            </motion.button>
          </div>
        </div>
      </Sheet>

      {/* ── Sheet: editar distribución ── */}
      <Sheet open={sheetDistribucion} onClose={() => setSheetDistribucion(false)} title="Editar reparto de ingresos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#7C6FF7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Diseñador 1</p>
            <div><label className="input-label">Nombre</label>
              <input className="input-field" value={d1Nombre} onChange={e => setD1Nombre(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div><label className="input-label">Porcentaje (%)</label>
              <input className="input-field" type="number" min={0} max={100} value={d1Pct} onChange={e => setD1Pct(e.target.value)} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700 }} />
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Diseñador 2</p>
            <div><label className="input-label">Nombre</label>
              <input className="input-field" value={d2Nombre} onChange={e => setD2Nombre(e.target.value)} placeholder="Nombre de tu socia" />
            </div>
            <div><label className="input-label">Porcentaje (%)</label>
              <input className="input-field" type="number" min={0} max={100} value={d2Pct} onChange={e => setD2Pct(e.target.value)} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700 }} />
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--income)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estudio</p>
            <div><label className="input-label">Porcentaje (%)</label>
              <input className="input-field" type="number" min={0} max={100} value={estPct} onChange={e => setEstPct(e.target.value)} style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700 }} />
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: pctOk ? 'rgba(45,212,164,0.1)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${pctOk ? 'rgba(45,212,164,0.3)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <p style={{ fontSize: '13px', color: pctOk ? 'var(--income)' : 'var(--expense)' }}>
              {pctOk ? 'Suma correcta ✓' : `Debe sumar 100% (suma actual: ${totalPct}%)`}
            </p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: pctOk ? 'var(--income)' : 'var(--expense)' }}>
              {totalPct}%
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveDistribucion}
            disabled={!pctOk}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: pctOk ? 'var(--accent)' : 'var(--bg-surface-3)',
              color: pctOk ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: pctOk ? 'pointer' : 'not-allowed',
            }}
          >
            Guardar reparto
          </motion.button>
        </div>
      </Sheet>

      {/* ── Sheet: editar categorías ── */}
      <Sheet open={sheetCategorias} onClose={() => { setSheetCategorias(false); setNuevaCat(''); setEditCatIdx(null) }} title="Categorías de gastos">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {state.estudio.categorias.map((cat, idx) => (
              <div key={`cat-${idx}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: editCatIdx === idx ? '8px 14px' : '12px 14px',
                background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
              }}>
                {editCatIdx === idx ? (
                  <input
                    className="input-field"
                    value={editCatVal}
                    onChange={e => setEditCatVal(e.target.value)}
                    onBlur={() => {
                      if (editCatVal.trim()) {
                        const nuevas = [...state.estudio.categorias]
                        nuevas[idx] = editCatVal.trim()
                        dispatch({ type: ACTIONS.SET_CATEGORIAS_ESTUDIO, categorias: nuevas })
                      }
                      setEditCatIdx(null)
                    }}
                    onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                    autoFocus
                    style={{ flex: 1, padding: '6px 10px', fontSize: '14px' }}
                  />
                ) : (
                  <>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{cat}</span>
                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setEditCatIdx(idx); setEditCatVal(cat) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Pencil size={13} color="var(--text-muted)" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.88 }} onClick={() => {
                      const nuevas = state.estudio.categorias.filter((_, i) => i !== idx)
                      dispatch({ type: ACTIONS.SET_CATEGORIAS_ESTUDIO, categorias: nuevas })
                    }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                      <XIcon size={15} color="var(--expense)" />
                    </motion.button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              className="input-field"
              placeholder="Nueva categoría..."
              value={nuevaCat}
              onChange={e => setNuevaCat(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && nuevaCat.trim()) {
                  dispatch({ type: ACTIONS.SET_CATEGORIAS_ESTUDIO, categorias: [...state.estudio.categorias, nuevaCat.trim()] })
                  setNuevaCat('')
                }
              }}
              style={{ flex: 1 }}
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
              if (!nuevaCat.trim()) return
              dispatch({ type: ACTIONS.SET_CATEGORIAS_ESTUDIO, categorias: [...state.estudio.categorias, nuevaCat.trim()] })
              setNuevaCat('')
            }}
              style={{ padding: '0 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PlusIcon size={18} />
            </motion.button>
          </div>
        </div>
      </Sheet>

      <ConfirmDeleteSheet
        open={!!confirmIngreso}
        onClose={() => setConfirmIngreso(null)}
        itemName={confirmIngreso?.cliente || confirmIngreso?.servicio}
        onConfirm={() => {
          dispatch({ type: ACTIONS.DELETE_INGRESO_ESTUDIO, id: confirmIngreso.id })
          haptic.light()
          showToast({ message: 'Ingreso eliminado', type: 'error' })
          setConfirmIngreso(null)
        }}
      />

      <ConfirmDeleteSheet
        open={!!confirmGasto}
        onClose={() => setConfirmGasto(null)}
        itemName={confirmGasto?.concepto}
        onConfirm={() => {
          dispatch({ type: ACTIONS.DELETE_GASTO_ESTUDIO, id: confirmGasto.id })
          haptic.light()
          showToast({ message: 'Gasto eliminado', type: 'error' })
          setConfirmGasto(null)
        }}
      />

      <Toast toast={toast} />

      {(tab === 0 || tab === 1) && (
        <FAB
          onClick={() => tab === 0 ? openAddIngreso() : openAddGasto()}
          color="var(--accent)"
        />
      )}
    </PageLayout>
  )
}

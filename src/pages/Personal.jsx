import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcTotalesPersonal, calcTotalesMes } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { nombreMes, formatFechaHora } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Sheet from '../components/ui/Sheet'
import SwipeRow from '../components/ui/SwipeRow'
import ConfirmDeleteSheet from '../components/ui/ConfirmDeleteSheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import TransactionList from '../components/personal/TransactionList'
import AddTransactionSheet from '../components/personal/AddTransactionSheet'
import EditBudgetSheet from '../components/personal/EditBudgetSheet'
import CotizacionesTab from '../components/personal/CotizacionesTab'
import PaymentMethodsBreakdown from '../components/dashboard/PaymentMethodsBreakdown'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

const TABS = ['Gastos', 'Ingresos', 'Proyectos', 'Presupuesto']

const NOMBRES_CAT = {
  casa: 'Casa', comida: 'Comida', familia: 'Familia', transporte: 'Transporte',
  viajes: 'Viajes', deudas: 'Deudas', salud: 'Salud', suscripciones: 'Suscripciones',
  gastosAnuales: 'Gastos Anuales', cuidadoPersonal: 'Cuidado Personal',
  entretenimiento: 'Entretenimiento', otros: 'Otros',
}

export default function Personal() {
  const { state, dispatch } = useFinance()
  const [tab, setTab] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  // Budget items sheet
  const [budgetSheet, setBudgetSheet] = useState({ open: false, categoriaKey: null, item: null })

  // Category edit/add sheet
  const [catSheet, setCatSheet]     = useState(false)
  const [editCatKey, setEditCatKey] = useState(null)
  const [catNombre, setCatNombre]   = useState('')
  const [catEmoji, setCatEmoji]     = useState('📦')

  // Quick budget per category
  const [budgetQuickSheet, setBudgetQuickSheet] = useState(false)
  const [budgetQuickKey, setBudgetQuickKey]     = useState(null)
  const [budgetQuickVal, setBudgetQuickVal]     = useState(0)

  // Confirmation delete modals
  const [confirmTx, setConfirmTx]   = useState(null)
  const [confirmIng, setConfirmIng] = useState(null)

  // Edit transaction
  const [editTx, setEditTx] = useState(null)

  // Income sheet (monthly)
  const [ingresoSheet, setIngresoSheet] = useState(false)
  const [editIngreso, setEditIngreso]   = useState(null)
  const [iFuente, setIFuente]           = useState('')
  const [iMonto, setIMonto]             = useState(0)

  const { mesActual, anioActual } = state.config
  const totales = calcTotalesPersonal(state, mesActual, anioActual)
  const { transacciones, totalGastado } = calcTotalesMes(state, mesActual, anioActual)
  const disponibleReal = totales.totalIngresos - totalGastado
  const ingresosMes = state.personal.ingresosMensuales?.[anioActual]?.[mesActual] || []

  // ── Category ────────────────────────────────────────────
  const openEditCat = (key) => {
    const cat = state.personal.presupuesto.categorias[key]
    setEditCatKey(key)
    setCatNombre(cat.nombre || NOMBRES_CAT[key] || key)
    setCatEmoji(cat.emoji || '📦')
    setCatSheet(true)
  }

  const openAddCat = () => {
    setEditCatKey(null); setCatNombre(''); setCatEmoji('📦'); setCatSheet(true)
  }

  const handleSaveCat = () => {
    if (!catNombre.trim()) return
    if (editCatKey) {
      dispatch({ type: ACTIONS.UPDATE_CATEGORIA, key: editCatKey, nombre: catNombre.trim(), emoji: catEmoji })
      showToast({ message: 'Categoría actualizada ✓' })
    } else {
      const key = `cat_${crypto.randomUUID().slice(0, 8)}`
      dispatch({ type: ACTIONS.ADD_CATEGORIA, key, nombre: catNombre.trim(), emoji: catEmoji })
      showToast({ message: 'Categoría creada ✓' })
    }
    setCatSheet(false)
  }

  const handleDeleteCat = () => {
    dispatch({ type: ACTIONS.DELETE_CATEGORIA, key: editCatKey })
    showToast({ message: 'Categoría eliminada', type: 'error' })
    setCatSheet(false)
  }

  // ── Quick budget ─────────────────────────────────────────
  const openBudgetQuick = (key) => {
    const cat = state.personal.presupuesto.categorias[key]
    const current = cat.presupuesto != null ? cat.presupuesto : cat.items.reduce((s, i) => s + i.monto, 0)
    setBudgetQuickKey(key)
    setBudgetQuickVal(current)
    setBudgetQuickSheet(true)
  }

  const handleSaveBudgetQuick = () => {
    const cat = state.personal.presupuesto.categorias[budgetQuickKey]
    dispatch({
      type: ACTIONS.UPDATE_CATEGORIA,
      key: budgetQuickKey,
      nombre: cat.nombre || NOMBRES_CAT[budgetQuickKey] || budgetQuickKey,
      emoji: cat.emoji,
      presupuesto: budgetQuickVal,
    })
    showToast({ message: 'Presupuesto actualizado ✓' })
    setBudgetQuickSheet(false)
  }

  // ── Budget items ─────────────────────────────────────────
  const openBudgetEdit = (categoriaKey, item = null) =>
    setBudgetSheet({ open: true, categoriaKey, item })
  const closeBudgetSheet = () =>
    setBudgetSheet({ open: false, categoriaKey: null, item: null })

  const handleDelete = (id) => {
    dispatch({ type: ACTIONS.DELETE_TRANSACCION, id, mes: mesActual, anio: anioActual })
    showToast({ message: 'Gasto eliminado', type: 'error' })
  }

  // ── Income (monthly) ─────────────────────────────────────
  const openAddIngreso = () => {
    setEditIngreso(null); setIFuente(''); setIMonto(0)
    setIngresoSheet(true)
  }

  const openEditIngreso = (ing) => {
    setEditIngreso(ing); setIFuente(ing.fuente); setIMonto(ing.monto)
    setIngresoSheet(true)
  }

  const handleSaveIngreso = () => {
    if (!iFuente.trim() || !iMonto) return
    if (editIngreso) {
      dispatch({ type: ACTIONS.UPDATE_INGRESO_MES, id: editIngreso.id, mes: mesActual, anio: anioActual, payload: { fuente: iFuente.trim(), monto: iMonto } })
      haptic.success()
      showToast({ message: 'Ingreso actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_INGRESO_MES, mes: mesActual, anio: anioActual, payload: { fuente: iFuente.trim(), monto: iMonto } })
      haptic.success()
      showToast({ message: 'Ingreso agregado ✓' })
    }
    setIngresoSheet(false)
  }

  const handleDeleteIngreso = () => {
    dispatch({ type: ACTIONS.DELETE_INGRESO_MES, id: editIngreso.id, mes: mesActual, anio: anioActual })
    haptic.light()
    showToast({ message: 'Ingreso eliminado', type: 'error' })
    setIngresoSheet(false)
  }

  return (
    <PageLayout
      header={<PageHeader subtitle={`${nombreMes(mesActual)} ${anioActual}`} title="Finanzas Personales" />}
    >
      {/* Sub-nav — pills */}
      <div style={{
        display: 'flex', gap: '6px', padding: '0 20px 16px',
        overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
      }}>
        {TABS.map((t, i) => (
          <motion.button
            key={t}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(i)}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-full)', flexShrink: 0,
              border: `1px solid ${tab === i ? 'var(--accent-border)' : 'var(--border)'}`,
              background: tab === i ? 'var(--accent-dim)' : 'var(--bg-surface)',
              color: tab === i ? 'var(--accent)' : 'var(--text-secondary)',
              fontSize: '13px', fontWeight: tab === i ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
            }}
          >
            {t}
          </motion.button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '0 20px 20px' }}>
        {[
          { label: 'Presupuesto', value: totales.totalPresupuesto, color: 'var(--text-primary)' },
          { label: 'Gastado',     value: totalGastado,             color: 'var(--expense)' },
          { label: 'Disponible',  value: disponibleReal,           color: disponibleReal >= 0 ? 'var(--income)' : 'var(--expense)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '4px', fontSize: '9px' }}>{kpi.label}</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: kpi.color, fontVariantNumeric: 'tabular-nums' }}>
              {formatCOP(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Gastos ───────────────────────────────────────── */}
      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TransactionList
            transacciones={transacciones}
            onDelete={handleDelete}
            onRequestDelete={(tx) => setConfirmTx(tx)}
            onEdit={(tx) => setEditTx(tx)}
          />
          <PaymentMethodsBreakdown transacciones={transacciones} />
          <div style={{ padding: '0 20px' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setSheetOpen(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
                border: '1px dashed rgba(124,111,247,0.35)', background: 'rgba(124,111,247,0.06)',
                color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
            >
              <Plus size={15} /> Agregar gasto
            </motion.button>
          </div>
        </div>
      )}

      {/* ── Presupuesto ──────────────────────────────────── */}
      {tab === 3 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Alerta déficit presupuesto */}
          {totales.totalPresupuesto > totales.totalIngresos && totales.totalIngresos > 0 && (
            <div style={{
              background: 'var(--expense-dim)',
              border: '1px solid var(--expense-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🚨</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--expense)', marginBottom: '2px' }}>
                  Presupuesto supera tus ingresos en {formatCOP(totales.totalPresupuesto - totales.totalIngresos)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Reduce las categorías o aumenta tus ingresos para cerrar este déficit
                </p>
              </div>
            </div>
          )}

          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface), rgba(124,111,247,0.06))',
            border: `1px solid ${totales.totalPresupuesto > totales.totalIngresos && totales.totalIngresos > 0 ? 'var(--expense-border)' : 'var(--accent-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total presupuestado</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: totales.totalPresupuesto > totales.totalIngresos && totales.totalIngresos > 0 ? 'var(--expense)' : 'var(--accent)' }}>
                {formatCOP(totales.totalPresupuesto)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Ingresos</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--income)' }}>
                {formatCOP(totales.totalIngresos)}
              </p>
            </div>
          </div>

          {Object.entries(state.personal.presupuesto.categorias).map(([key, cat]) => {
            const total = cat.presupuesto != null ? cat.presupuesto : cat.items.reduce((s, i) => s + i.monto / (i.duracionMeses || 1), 0)
            return (
              <div key={key} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: 'var(--bg-surface-2)',
                  borderBottom: cat.items.length > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  {/* Nombre + editar categoría */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.emoji} {cat.nombre || NOMBRES_CAT[key]}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={(e) => { e.stopPropagation(); openEditCat(key) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <Pencil size={13} color="var(--text-muted)" />
                    </motion.button>
                  </div>
                  {/* Total (toca para editar) + agregar item */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => openBudgetQuick(key)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <span style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '15px',
                        color: total > 0 ? 'var(--accent)' : 'var(--text-muted)',
                        borderBottom: '1px dashed var(--accent-border)',
                      }}>
                        {formatCOP(total)}
                      </span>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openBudgetEdit(key, null)}
                      style={{
                        width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--accent-dim)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Plus size={14} color="var(--accent)" />
                    </motion.button>
                  </div>
                </div>

                {cat.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
                    onClick={() => openBudgetEdit(key, item)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: i < cat.items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <Pencil size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.nombre}
                        </p>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                          {item.fijo    && <span className="badge badge-purple" style={{ fontSize: '9px', padding: '1px 5px' }}>Fijo</span>}
                          {item.tarjeta && <span className="badge badge-blue"   style={{ fontSize: '9px', padding: '1px 5px' }}>Tarjeta</span>}
                          {item.hormiga && <span style={{ fontSize: '11px' }}>🐜</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCOP(Math.round(item.monto / (item.duracionMeses || 1)))}
                      </span>
                      {(item.duracionMeses || 1) > 1 && (
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          /{item.duracionMeses} meses
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {cat.items.length === 0 && (
                  <motion.div
                    whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
                    onClick={() => openBudgetEdit(key, null)}
                    style={{ padding: '14px 16px', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+ Agregar conceptos detallados</p>
                  </motion.div>
                )}
              </div>
            )
          })}

          <motion.button
            whileTap={{ scale: 0.97 }} onClick={openAddCat}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            <Plus size={14} /> Nueva categoría
          </motion.button>
        </div>
      )}

      {/* ── Proyectos ────────────────────────────────────── */}
      {tab === 2 && <CotizacionesTab />}

      {/* ── Ingresos ─────────────────────────────────────── */}
      {tab === 1 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface), var(--income-dim))',
            border: '1px solid var(--income-border)',
            borderRadius: 'var(--radius-2xl)', padding: '20px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total ingresos · {nombreMes(mesActual)} {anioActual}</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: 'var(--income)' }}>
              {formatCOP(totales.totalIngresos)}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {ingresosMes.length} {ingresosMes.length === 1 ? 'fuente registrada' : 'fuentes registradas'} este mes
            </p>
          </div>

          {ingresosMes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>💰</p>
              <p style={{ fontSize: '14px' }}>Sin ingresos este mes todavía</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Agrega los ingresos que recibiste en {nombreMes(mesActual)}</p>
            </div>
          )}

          {ingresosMes.map(ing => (
            <SwipeRow
              key={ing.id}
              onRequestDelete={() => setConfirmIng(ing)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                onClick={() => openEditIngreso(ing)}
                style={{
                  padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {ing.fuente}
                  </p>
                  {ing.registradoEn && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatFechaHora(ing.registradoEn)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--income)' }}>
                    {formatCOP(ing.monto)}
                  </p>
                  <Pencil size={13} color="var(--text-muted)" />
                </div>
              </div>
            </SwipeRow>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openAddIngreso}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--income-border)', background: 'var(--income-dim)',
              color: 'var(--income)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            <Plus size={15} /> Agregar ingreso
          </motion.button>
        </div>
      )}

      <Toast toast={toast} />

      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => showToast({ message: 'Gasto registrado ✓', type: 'success' })}
        mes={mesActual}
        anio={anioActual}
      />

      <AddTransactionSheet
        open={!!editTx}
        onClose={() => setEditTx(null)}
        onSuccess={() => showToast({ message: 'Gasto actualizado ✓', type: 'success' })}
        onDelete={(tx) => { setEditTx(null); setConfirmTx(tx) }}
        transaction={editTx}
        mes={mesActual}
        anio={anioActual}
      />

      <EditBudgetSheet
        open={budgetSheet.open}
        onClose={closeBudgetSheet}
        categoriaKey={budgetSheet.categoriaKey}
        item={budgetSheet.item}
        onSuccess={() => showToast({ message: budgetSheet.item ? 'Presupuesto actualizado ✓' : 'Concepto agregado ✓' })}
      />

      {/* Sheet: editar / nueva categoría */}
      <Sheet open={catSheet} onClose={() => setCatSheet(false)} title={editCatKey ? 'Editar categoría' : 'Nueva categoría'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input className="input-field" value={catEmoji} onChange={e => setCatEmoji(e.target.value)} style={{ width: '64px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre</label>
              <input className="input-field" value={catNombre} onChange={e => setCatNombre(e.target.value)} placeholder="Casa, Comida..." />
            </div>
          </div>

          {editCatKey && (() => {
            const items = state.personal.presupuesto.categorias[editCatKey]?.items || []
            return items.length > 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                Esta categoría tiene {items.length} {items.length === 1 ? 'concepto' : 'conceptos'}. Si la eliminas, se borrarán todos.
              </p>
            ) : null
          })()}

          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveCat} disabled={!catNombre.trim()}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: catNombre.trim() ? 'var(--accent)' : 'var(--bg-surface-3)', color: catNombre.trim() ? 'white' : 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
          >
            {editCatKey ? 'Guardar cambios' : 'Crear categoría'}
          </motion.button>

          {editCatKey && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteCat}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar categoría
            </motion.button>
          )}
        </div>
      </Sheet>

      {/* Sheet: presupuesto rápido por categoría */}
      {budgetQuickKey && (
        <Sheet open={budgetQuickSheet} onClose={() => setBudgetQuickSheet(false)}
          title={`Presupuesto · ${state.personal.presupuesto.categorias[budgetQuickKey]?.nombre || NOMBRES_CAT[budgetQuickKey] || budgetQuickKey}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label">Monto mensual</label>
              <AmountInput value={budgetQuickVal} onChange={setBudgetQuickVal} autoFocus />
            </div>
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveBudgetQuick}
              style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--accent)', color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
            >
              Guardar presupuesto
            </motion.button>
          </div>
        </Sheet>
      )}

      {/* Sheet: agregar / editar ingreso mensual */}
      <Sheet open={ingresoSheet} onClose={() => setIngresoSheet(false)} title={editIngreso ? 'Editar ingreso' : `Ingreso · ${nombreMes(mesActual)}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Fuente</label>
            <input className="input-field" value={iFuente} onChange={e => setIFuente(e.target.value)} placeholder="Salario, freelance, arriendo..." autoFocus={ingresoSheet} />
          </div>
          <div>
            <label className="input-label">Monto recibido</label>
            <AmountInput value={iMonto} onChange={setIMonto} />
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveIngreso}
            disabled={!iFuente.trim() || !iMonto}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: iFuente.trim() && iMonto ? 'var(--income)' : 'var(--bg-surface-3)', color: iFuente.trim() && iMonto ? 'white' : 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
          >
            {editIngreso ? 'Guardar cambios' : 'Agregar ingreso'}
          </motion.button>

          {editIngreso && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteIngreso}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar ingreso
            </motion.button>
          )}
        </div>
      </Sheet>

      {/* Confirmación: eliminar transacción */}
      <ConfirmDeleteSheet
        open={!!confirmTx}
        onClose={() => setConfirmTx(null)}
        itemName={confirmTx?.concepto}
        onConfirm={() => {
          handleDelete(confirmTx.id)
          setConfirmTx(null)
        }}
      />

      {/* Confirmación: eliminar ingreso */}
      <ConfirmDeleteSheet
        open={!!confirmIng}
        onClose={() => setConfirmIng(null)}
        itemName={confirmIng?.fuente}
        onConfirm={() => {
          dispatch({ type: ACTIONS.DELETE_INGRESO_MES, id: confirmIng.id, mes: mesActual, anio: anioActual })
          haptic.light()
          showToast({ message: 'Ingreso eliminado', type: 'error' })
          setConfirmIng(null)
        }}
      />
    </PageLayout>
  )
}

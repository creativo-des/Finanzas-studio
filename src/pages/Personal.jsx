import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcTotalesPersonal, calcTotalesMes } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { nombreMes } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import FAB from '../components/ui/FAB'
import Sheet from '../components/ui/Sheet'
import SwipeRow from '../components/ui/SwipeRow'
import ConfirmDeleteSheet from '../components/ui/ConfirmDeleteSheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import TransactionList from '../components/personal/TransactionList'
import AddTransactionSheet from '../components/personal/AddTransactionSheet'
import EditBudgetSheet from '../components/personal/EditBudgetSheet'
import CategoryGrid from '../components/dashboard/CategoryGrid'
import PaymentMethodsBreakdown from '../components/dashboard/PaymentMethodsBreakdown'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

const TABS = ['Gastos', 'Categorías', 'Presupuesto', 'Ingresos']

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

  // Income sheet
  const [ingresoSheet, setIngresoSheet] = useState(false)
  const [editIngreso, setEditIngreso]   = useState(null)
  const [iNombre, setINombre]           = useState('')
  const [iMonto, setIMonto]             = useState(0)
  const [iTipo, setITipo]               = useState('fijo')

  const { mesActual, anioActual } = state.config
  const totales = calcTotalesPersonal(state)
  const { transacciones, totalGastado } = calcTotalesMes(state, mesActual, anioActual)
  const disponibleReal = totales.totalIngresos - totalGastado

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
      const key = `cat_${Math.random().toString(36).slice(2, 7)}`
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

  // ── Income ───────────────────────────────────────────────
  const openAddIngreso = () => {
    setEditIngreso(null); setINombre(''); setIMonto(0); setITipo('fijo')
    setIngresoSheet(true)
  }

  const openEditIngreso = (ing) => {
    setEditIngreso(ing); setINombre(ing.nombre); setIMonto(ing.monto); setITipo(ing.tipo)
    setIngresoSheet(true)
  }

  const handleSaveIngreso = () => {
    if (!iNombre.trim() || !iMonto) return
    if (editIngreso) {
      dispatch({ type: ACTIONS.UPDATE_INGRESO, id: editIngreso.id, payload: { nombre: iNombre.trim(), monto: iMonto, tipo: iTipo } })
      haptic.success()
      showToast({ message: 'Ingreso actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_INGRESO, payload: { nombre: iNombre.trim(), monto: iMonto, tipo: iTipo, activo: true } })
      haptic.success()
      showToast({ message: 'Ingreso agregado ✓' })
    }
    setIngresoSheet(false)
  }

  const handleDeleteIngreso = () => {
    dispatch({ type: ACTIONS.DELETE_INGRESO, id: editIngreso.id })
    haptic.light()
    showToast({ message: 'Ingreso eliminado', type: 'error' })
    setIngresoSheet(false)
  }

  return (
    <PageLayout
      header={<PageHeader subtitle={`${nombreMes(mesActual)} ${anioActual}`} title="Finanzas Personales" />}
    >
      {/* Sub-nav */}
      <div className="scroll-x" style={{ padding: '0 20px 16px', gap: '8px' }}>
        {TABS.map((t, i) => (
          <motion.button
            key={t} whileTap={{ scale: 0.95 }} onClick={() => setTab(i)}
            style={{
              padding: '8px 18px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap',
              border: `1px solid ${tab === i ? 'var(--accent-border)' : 'var(--border)'}`,
              background: tab === i ? 'var(--accent-dim)' : 'transparent',
              color: tab === i ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '14px', fontWeight: tab === i ? 600 : 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >{t}</motion.button>
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
          />
          <PaymentMethodsBreakdown transacciones={transacciones} />
        </div>
      )}

      {/* ── Categorías ───────────────────────────────────── */}
      {tab === 1 && (
        <CategoryGrid categorias={state.personal.presupuesto.categorias} transacciones={transacciones} />
      )}

      {/* ── Presupuesto ──────────────────────────────────── */}
      {tab === 2 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface), rgba(124,111,247,0.06))',
            border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)',
            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total presupuestado</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--accent)' }}>
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
            const total = cat.presupuesto != null ? cat.presupuesto : cat.items.reduce((s, i) => s + i.monto, 0)
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
                    <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: '12px' }}>
                      {formatCOP(item.monto)}
                    </span>
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

      {/* ── Ingresos ─────────────────────────────────────── */}
      {tab === 3 && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{
            background: 'linear-gradient(135deg, var(--bg-surface), rgba(45,212,164,0.06))',
            border: '1px solid rgba(45,212,164,0.2)',
            borderRadius: 'var(--radius-2xl)', padding: '20px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total ingresos del mes</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '32px', color: 'var(--income)' }}>
              {formatCOP(totales.totalIngresos)}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {state.personal.ingresos.filter(i => i.activo).length} fuentes activas
            </p>
          </div>

          {state.personal.ingresos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>💰</p>
              <p>Agrega tus fuentes de ingreso con el +</p>
            </div>
          ) : (
            state.personal.ingresos.map(ing => (
              <SwipeRow
                key={ing.id}
                onRequestDelete={() => setConfirmIng(ing)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  opacity: ing.activo ? 1 : 0.45,
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
                    <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {ing.nombre}
                    </p>
                    <span className={`badge ${ing.tipo === 'fijo' ? 'badge-purple' : 'badge-blue'}`}>
                      {ing.tipo}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--income)' }}>
                      {formatCOP(ing.monto)}
                    </p>
                    <Pencil size={13} color="var(--text-muted)" />
                  </div>
                </div>
              </SwipeRow>
            ))
          )}
        </div>
      )}

      <Toast toast={toast} />
      <FAB
        onClick={() => tab === 3 ? openAddIngreso() : setSheetOpen(true)}
        color={tab === 3 ? 'var(--income)' : undefined}
      />

      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => showToast({ message: 'Gasto registrado ✓', type: 'success' })}
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

      {/* Sheet: agregar / editar ingreso */}
      <Sheet open={ingresoSheet} onClose={() => setIngresoSheet(false)} title={editIngreso ? 'Editar ingreso' : 'Nuevo ingreso'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Nombre</label>
            <input className="input-field" value={iNombre} onChange={e => setINombre(e.target.value)} placeholder="Salario, freelance, arriendo..." />
          </div>
          <div>
            <label className="input-label">Monto mensual</label>
            <AmountInput value={iMonto} onChange={setIMonto} />
          </div>
          <div>
            <label className="input-label">Tipo</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['fijo', 'variable'].map(t => (
                <motion.button key={t} whileTap={{ scale: 0.95 }} onClick={() => setITipo(t)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `1px solid ${iTipo === t ? 'rgba(45,212,164,0.4)' : 'var(--border)'}`,
                    background: iTipo === t ? 'var(--income-dim)' : 'var(--bg-surface-3)',
                    color: iTipo === t ? 'var(--income)' : 'var(--text-secondary)',
                    fontFamily: 'Inter, sans-serif', fontWeight: iTipo === t ? 600 : 400, textTransform: 'capitalize',
                  }}
                >{t}</motion.button>
              ))}
            </div>
          </div>

          {editIngreso && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteIngreso}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
            >
              Eliminar ingreso
            </motion.button>
          )}

          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveIngreso}
            disabled={!iNombre.trim() || !iMonto}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: iNombre.trim() && iMonto ? 'var(--income)' : 'var(--bg-surface-3)', color: iNombre.trim() && iMonto ? 'white' : 'var(--text-muted)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer' }}
          >
            {editIngreso ? 'Guardar cambios' : 'Agregar ingreso'}
          </motion.button>
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
        itemName={confirmIng?.nombre}
        onConfirm={() => {
          dispatch({ type: ACTIONS.DELETE_INGRESO, id: confirmIng.id })
          haptic.light()
          showToast({ message: 'Ingreso eliminado', type: 'error' })
          setConfirmIng(null)
        }}
      />
    </PageLayout>
  )
}

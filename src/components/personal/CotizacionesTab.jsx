import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Minus } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { ACTIONS } from '../../context/actions'
import { formatCOP } from '../../utils/formatCurrency'
import { sanitizeText, sanitizeAmount, sanitizeInt } from '../../utils/sanitize'
import Sheet from '../ui/Sheet'
import AmountInput from '../ui/AmountInput'
import Toast from '../ui/Toast'
import { useToast } from '../../hooks/useToast'
import { useHaptic } from '../../hooks/useHaptic'

export default function CotizacionesTab() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  const proyectos = state.cotizaciones || []

  // ── Proyecto sheet ────────────────────────────────────
  const [proyectoSheet, setProyectoSheet] = useState(false)
  const [editProyecto, setEditProyecto]   = useState(null)
  const [pNombre, setPNombre] = useState('')
  const [pEmoji, setPEmoji]   = useState('🛒')

  // ── Item sheet ────────────────────────────────────────
  const [itemSheet, setItemSheet]   = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [itemProjId, setItemProjId] = useState(null)
  const [iNombre, setINombre]       = useState('')
  const [iPrecio, setIPrecio]       = useState(0)

  // ── Proyecto ──────────────────────────────────────────
  const openAddProyecto = () => {
    setEditProyecto(null); setPNombre(''); setPEmoji('🛒')
    setProyectoSheet(true)
  }

  const openEditProyecto = (p) => {
    setEditProyecto(p); setPNombre(p.nombre); setPEmoji(p.emoji || '🛒')
    setProyectoSheet(true)
  }

  const handleSaveProyecto = () => {
    const nombreClean = sanitizeText(pNombre, 80)
    if (!nombreClean) return
    if (editProyecto) {
      dispatch({ type: ACTIONS.UPDATE_COTIZACION, id: editProyecto.id, payload: { nombre: nombreClean, emoji: pEmoji } })
      showToast({ message: 'Proyecto actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_COTIZACION, payload: { nombre: nombreClean, emoji: pEmoji, meses: 12 } })
      haptic.success()
      showToast({ message: 'Proyecto creado ✓' })
    }
    setProyectoSheet(false)
  }

  const handleDeleteProyecto = () => {
    dispatch({ type: ACTIONS.DELETE_COTIZACION, id: editProyecto.id })
    haptic.light()
    showToast({ message: 'Proyecto eliminado', type: 'error' })
    setProyectoSheet(false)
  }

  const updateMeses = (id, val) => {
    dispatch({ type: ACTIONS.UPDATE_COTIZACION, id, payload: { meses: sanitizeInt(val, 1, 600) } })
  }

  // ── Item ──────────────────────────────────────────────
  const openAddItem = (proyectoId) => {
    setEditItem(null); setItemProjId(proyectoId)
    setINombre(''); setIPrecio(0)
    setItemSheet(true)
  }

  const openEditItem = (proyectoId, item) => {
    setEditItem(item); setItemProjId(proyectoId)
    setINombre(item.nombre || ''); setIPrecio(item.precio || 0)
    setItemSheet(true)
  }

  const handleSaveItem = () => {
    const nombreClean = sanitizeText(iNombre, 80)
    const precioClean = sanitizeAmount(iPrecio, 1)
    if (!nombreClean || !precioClean) return
    const payload = { nombre: nombreClean, precio: precioClean }
    if (editItem) {
      dispatch({ type: ACTIONS.UPDATE_ITEM_COT, cotizacionId: itemProjId, id: editItem.id, payload })
      showToast({ message: 'Ítem actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_ITEM_COT, cotizacionId: itemProjId, payload })
      haptic.success()
      showToast({ message: 'Ítem agregado ✓' })
    }
    setItemSheet(false)
  }

  const handleDeleteItem = () => {
    dispatch({ type: ACTIONS.DELETE_ITEM_COT, cotizacionId: itemProjId, id: editItem.id })
    haptic.light()
    showToast({ message: 'Ítem eliminado', type: 'error' })
    setItemSheet(false)
  }

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Estado vacío ── */}
      {proyectos.length === 0 && (
        <>
          <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
            <p style={{ fontSize: '52px', marginBottom: '14px' }}>🎯</p>
            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Sin proyectos de ahorro
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '280px', margin: '0 auto' }}>
              Crea un proyecto, agrega los ítems con su precio y elige en cuántos meses quieres lograrlo.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openAddProyecto}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--accent-border)', background: 'var(--accent-dim)',
              color: 'var(--accent)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            <Plus size={16} /> Crear primer proyecto
          </motion.button>
        </>
      )}

      {/* ── Tarjetas de proyectos ── */}
      {proyectos.map(p => {
        const total  = p.items.reduce((s, i) => s + i.precio, 0)
        const meses  = p.meses || 12
        const porMes = total > 0 ? Math.ceil(total / meses) : 0

        return (
          <div key={p.id} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {/* Cabecera */}
            <div style={{ padding: '16px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{p.emoji || '🛒'}</span>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.nombre}
                  </p>
                </div>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => openEditProyecto(p)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0 }}
                >
                  <Pencil size={14} color="var(--text-muted)" />
                </motion.button>
              </div>

              {/* Cálculo mensual */}
              {total > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--bg-surface-2), rgba(124,111,247,0.08))',
                  borderRadius: 'var(--radius-md)', padding: '14px 16px',
                  border: '1px solid var(--accent-border)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                    Ahorro mensual necesario
                  </p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--accent)', lineHeight: 1.1, marginBottom: '6px' }}>
                    {formatCOP(porMes)}<span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/mes</span>
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Total: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCOP(total)}</span>
                  </p>

                  {/* Selector de meses */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>¿En cuántos meses?</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => updateMeses(p.id, meses - 1)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          border: '1px solid var(--border)', background: 'var(--bg-surface)',
                          color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Minus size={13} />
                      </motion.button>
                      <span style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                        fontSize: '18px', color: 'var(--text-primary)',
                        minWidth: '36px', textAlign: 'center',
                      }}>
                        {meses}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => updateMeses(p.id, meses + 1)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          border: '1px solid var(--border)', background: 'var(--bg-surface)',
                          color: 'var(--text-secondary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Plus size={13} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de ítems */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {p.items.length === 0 && (
                <p style={{ padding: '18px 16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Agrega ítems para calcular tu meta de ahorro
                </p>
              )}
              {p.items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
                  onClick={() => openEditItem(p.id, item)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 16px', cursor: 'pointer',
                    borderBottom: idx < p.items.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>{item.nombre}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCOP(item.precio)}
                    </p>
                    <Pencil size={11} color="var(--text-muted)" />
                  </div>
                </motion.div>
              ))}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => openAddItem(p.id)}
                style={{
                  width: '100%', padding: '13px 16px', border: 'none',
                  borderTop: p.items.length > 0 ? '1px solid var(--border)' : 'none',
                  background: 'var(--bg-surface-2)',
                  color: 'var(--accent)', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Plus size={13} /> Agregar ítem
              </motion.button>
            </div>
          </div>
        )
      })}

      {/* Botón nuevo proyecto */}
      {proyectos.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openAddProyecto}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border)', background: 'transparent',
            color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <Plus size={14} /> Nuevo proyecto
        </motion.button>
      )}

      {/* ─── Sheets — siempre montados ─── */}

      <Sheet open={proyectoSheet} onClose={() => setProyectoSheet(false)} title={editProyecto ? 'Editar proyecto' : 'Nuevo proyecto'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input className="input-field" value={pEmoji} maxLength={5} onChange={e => setPEmoji(e.target.value)}
                style={{ width: '64px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre del proyecto</label>
              <input className="input-field" value={pNombre} maxLength={80} onChange={e => setPNombre(e.target.value)}
                placeholder="Sofá sala, MacBook Air..." />
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveProyecto} disabled={!pNombre.trim()}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: pNombre.trim() ? 'var(--accent)' : 'var(--bg-surface-3)',
              color: pNombre.trim() ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
            }}
          >
            {editProyecto ? 'Guardar cambios' : 'Crear proyecto'}
          </motion.button>
          {editProyecto && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteProyecto}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)',
                color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Eliminar proyecto
            </motion.button>
          )}
        </div>
      </Sheet>

      <Sheet open={itemSheet} onClose={() => setItemSheet(false)} title={editItem ? 'Editar ítem' : 'Agregar ítem'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Nombre del ítem</label>
            <input className="input-field" value={iNombre} maxLength={80} onChange={e => setINombre(e.target.value)}
              placeholder="Sofá 3 puestos, MacBook Air..." />
          </div>
          <div>
            <label className="input-label">Precio</label>
            <AmountInput value={iPrecio} onChange={setIPrecio} />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveItem}
            disabled={!iNombre.trim() || !iPrecio}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: iNombre.trim() && iPrecio ? 'var(--accent)' : 'var(--bg-surface-3)',
              color: iNombre.trim() && iPrecio ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
            }}
          >
            {editItem ? 'Guardar cambios' : 'Agregar al proyecto'}
          </motion.button>
          {editItem && (
            <motion.button whileTap={{ scale: 0.96 }} onClick={handleDeleteItem}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)',
                color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Eliminar ítem
            </motion.button>
          )}
        </div>
      </Sheet>

      <Toast toast={toast} />
    </div>
  )
}

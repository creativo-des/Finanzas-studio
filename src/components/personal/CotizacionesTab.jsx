import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import { ACTIONS } from '../../context/actions'
import { formatCOP } from '../../utils/formatCurrency'
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

  // ── Estado sheets ─────────────────────────────────────
  const [proyectoSheet, setProyectoSheet] = useState(false)
  const [editProyecto, setEditProyecto]   = useState(null)
  const [pNombre, setPNombre] = useState('')
  const [pEmoji, setPEmoji]   = useState('🛒')
  const [pFecha, setPFecha]   = useState('')

  const [itemSheet, setItemSheet]       = useState(false)
  const [editItem, setEditItem]         = useState(null)
  const [itemProjId, setItemProjId]     = useState(null)
  const [iNombre, setINombre]           = useState('')
  const [iTienda, setITienda]           = useState('')
  const [iPrecio, setIPrecio]           = useState(0)
  const [iImagen, setIImagen]           = useState('')

  const [abonarSheet, setAbonarSheet] = useState(null)
  const [abonoMonto, setAbonoMonto]   = useState(0)

  const [expanded, setExpanded] = useState({})

  // ── Handlers: Proyecto ────────────────────────────────
  const openAddProyecto = () => {
    setEditProyecto(null); setPNombre(''); setPEmoji('🛒'); setPFecha('')
    setProyectoSheet(true)
  }

  const openEditProyecto = (p) => {
    setEditProyecto(p); setPNombre(p.nombre); setPEmoji(p.emoji || '🛒'); setPFecha(p.fechaMeta || '')
    setProyectoSheet(true)
  }

  const handleSaveProyecto = () => {
    if (!pNombre.trim()) return
    if (editProyecto) {
      dispatch({ type: ACTIONS.UPDATE_COTIZACION, id: editProyecto.id, payload: { nombre: pNombre.trim(), emoji: pEmoji, fechaMeta: pFecha } })
      showToast({ message: 'Proyecto actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_COTIZACION, payload: { nombre: pNombre.trim(), emoji: pEmoji, fechaMeta: pFecha } })
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

  // ── Handlers: Item ────────────────────────────────────
  const openAddItem = (proyectoId) => {
    setEditItem(null); setItemProjId(proyectoId)
    setINombre(''); setITienda(''); setIPrecio(0); setIImagen('')
    setItemSheet(true)
  }

  const openEditItem = (proyectoId, item) => {
    setEditItem(item); setItemProjId(proyectoId)
    setINombre(item.nombre || ''); setITienda(item.tienda || '')
    setIPrecio(item.precio || 0); setIImagen(item.imagen || '')
    setItemSheet(true)
  }

  const handleSaveItem = () => {
    if (!iNombre.trim() || !iPrecio) return
    const payload = { nombre: iNombre.trim(), tienda: iTienda.trim(), precio: iPrecio, imagen: iImagen.trim() }
    if (editItem) {
      dispatch({ type: ACTIONS.UPDATE_ITEM_COT, cotizacionId: itemProjId, id: editItem.id, payload })
      showToast({ message: 'Item actualizado ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_ITEM_COT, cotizacionId: itemProjId, payload })
      haptic.success()
      showToast({ message: 'Item agregado ✓' })
    }
    setItemSheet(false)
  }

  const handleDeleteItem = () => {
    dispatch({ type: ACTIONS.DELETE_ITEM_COT, cotizacionId: itemProjId, id: editItem.id })
    haptic.light()
    showToast({ message: 'Item eliminado', type: 'error' })
    setItemSheet(false)
  }

  // ── Handlers: Abonar ─────────────────────────────────
  const handleAbonar = () => {
    if (!abonoMonto) return
    dispatch({ type: ACTIONS.ABONAR_COTIZACION, id: abonarSheet, monto: abonoMonto })
    haptic.success()
    showToast({ message: 'Abono registrado ✓' })
    setAbonarSheet(null); setAbonoMonto(0)
  }

  // ── Helpers ───────────────────────────────────────────
  const calcMeses = (fechaMeta) => {
    if (!fechaMeta) return null
    const hoy  = new Date()
    const meta = new Date(fechaMeta + '-01')
    const m    = (meta.getFullYear() - hoy.getFullYear()) * 12 + (meta.getMonth() - hoy.getMonth())
    return Math.max(1, m)
  }

  const totalGeneral   = proyectos.reduce((s, p) => s + p.items.reduce((si, i) => si + i.precio, 0), 0)
  const ahorroGeneral  = proyectos.reduce((s, p) => s + (p.ahorroActual || 0), 0)

  // ── Empty state ────────────────────────────────────────
  if (proyectos.length === 0) {
    return (
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', padding: '48px 0 24px' }}>
          <p style={{ fontSize: '52px', marginBottom: '14px' }}>🛒</p>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Sin proyectos de compra</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '280px', margin: '0 auto' }}>
            Crea un proyecto, agrega los productos con tienda y precio, y lleva el control de lo que necesitas ahorrar.
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
        <Toast toast={toast} />
      </div>
    )
  }

  return (
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Resumen global — solo si hay más de un proyecto */}
      {proyectos.length > 1 && (
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-surface), rgba(124,111,247,0.08))',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        }}>
          <p className="label-uppercase" style={{ marginBottom: '10px' }}>Total todos los proyectos</p>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '26px', color: 'var(--accent)' }}>
            {formatCOP(totalGeneral)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Ahorrado: <span style={{ color: 'var(--income)', fontWeight: 600 }}>{formatCOP(ahorroGeneral)}</span>
              {' '}· Falta: <span style={{ color: 'var(--expense)', fontWeight: 600 }}>{formatCOP(Math.max(0, totalGeneral - ahorroGeneral))}</span>
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
              {totalGeneral > 0 ? Math.round(Math.min(100, ahorroGeneral / totalGeneral * 100)) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de proyectos */}
      {proyectos.map(p => {
        const total      = p.items.reduce((s, i) => s + i.precio, 0)
        const ahorro     = p.ahorroActual || 0
        const pct        = total > 0 ? Math.min(100, ahorro / total * 100) : 0
        const faltante   = Math.max(0, total - ahorro)
        const meses      = calcMeses(p.fechaMeta)
        const necesario  = meses && faltante > 0 ? Math.ceil(faltante / meses) : null
        const completo   = ahorro >= total && total > 0
        const isOpen     = expanded[p.id]

        return (
          <div key={p.id} style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${completo ? 'rgba(45,212,164,0.35)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>

            {/* ── Cabecera del proyecto ── */}
            <div style={{ padding: '16px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{p.emoji || '🛒'}</span>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.nombre}
                    </p>
                    {completo && (
                      <span className="badge badge-green" style={{ fontSize: '10px', padding: '2px 7px' }}>✓ Completado</span>
                    )}
                  </div>
                  {p.fechaMeta && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '28px' }}>
                      Meta: {new Date(p.fechaMeta + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                      {meses ? ` · ${meses} ${meses === 1 ? 'mes' : 'meses'}` : ''}
                    </p>
                  )}
                </div>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => openEditProyecto(p)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', flexShrink: 0, marginTop: '-2px' }}
                >
                  <Pencil size={14} color="var(--text-muted)" />
                </motion.button>
              </div>

              {/* Barra de progreso */}
              <div style={{ background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-full)', height: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 'var(--radius-full)',
                    background: completo ? 'var(--income)' : 'linear-gradient(90deg, var(--accent), #a78bfa)',
                  }}
                />
              </div>

              {/* Monto + acciones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '19px', color: completo ? 'var(--income)' : 'var(--text-primary)', lineHeight: 1.2 }}>
                    {formatCOP(ahorro)}
                    <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)' }}>
                      {' '}/ {formatCOP(total)}
                    </span>
                  </p>
                  {necesario && (
                    <p style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '3px', fontWeight: 600 }}>
                      Ahorra ~{formatCOP(necesario)}/mes para llegar a tiempo
                    </p>
                  )}
                  {!necesario && !completo && total > 0 && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Falta {formatCOP(faltante)}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { setAbonarSheet(p.id); setAbonoMonto(0) }}
                    style={{
                      padding: '8px 14px', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--accent-border)', background: 'var(--accent-dim)',
                      color: 'var(--accent)', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    + Abonar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setExpanded(e => ({ ...e, [p.id]: !e[p.id] }))}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex' }}
                  >
                    {isOpen
                      ? <ChevronUp  size={16} color="var(--text-muted)" />
                      : <ChevronDown size={16} color="var(--text-muted)" />}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* ── Items expandibles ── */}
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)' }}>

                {p.items.length === 0 && (
                  <p style={{ padding: '18px 16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Sin items — agrega productos para calcular el total
                  </p>
                )}

                {p.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
                    onClick={() => openEditItem(p.id, item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: idx < p.items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {/* Miniatura */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-surface-3)', flexShrink: 0,
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.imagen ? (
                        <img
                          src={item.imagen} alt={item.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }}
                        />
                      ) : null}
                      <span style={{ fontSize: '20px', display: item.imagen ? 'none' : 'flex' }}>📦</span>
                    </div>

                    {/* Nombre + tienda */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nombre}
                      </p>
                      {item.tienda && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.tienda}</p>
                      )}
                    </div>

                    {/* Precio */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCOP(item.precio)}
                      </p>
                      <Pencil size={11} color="var(--text-muted)" style={{ marginTop: '3px' }} />
                    </div>
                  </motion.div>
                ))}

                {/* Botón agregar item */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddItem(p.id)}
                  style={{
                    width: '100%', padding: '13px 16px',
                    border: 'none',
                    borderTop: p.items.length > 0 ? '1px solid var(--border)' : 'none',
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Plus size={13} /> Agregar producto
                </motion.button>
              </div>
            )}
          </div>
        )
      })}

      {/* Nuevo proyecto */}
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

      {/* ─── Sheet: Proyecto ─── */}
      <Sheet open={proyectoSheet} onClose={() => setProyectoSheet(false)} title={editProyecto ? 'Editar proyecto' : 'Nuevo proyecto'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input className="input-field" value={pEmoji} onChange={e => setPEmoji(e.target.value)}
                style={{ width: '64px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre del proyecto</label>
              <input className="input-field" value={pNombre} onChange={e => setPNombre(e.target.value)}
                placeholder="Sofá sala, Computador..." autoFocus={proyectoSheet && !editProyecto} />
            </div>
          </div>
          <div>
            <label className="input-label">Fecha meta (opcional)</label>
            <input className="input-field" type="month" value={pFecha} onChange={e => setPFecha(e.target.value)} />
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

      {/* ─── Sheet: Item ─── */}
      <Sheet open={itemSheet} onClose={() => setItemSheet(false)} title={editItem ? 'Editar producto' : 'Agregar producto'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label">Producto</label>
            <input className="input-field" value={iNombre} onChange={e => setINombre(e.target.value)}
              placeholder="Sofá 3 puestos, MacBook Air..." />
          </div>
          <div>
            <label className="input-label">Tienda / Marca</label>
            <input className="input-field" value={iTienda} onChange={e => setITienda(e.target.value)}
              placeholder="IKEA, Apple, Falabella..." />
          </div>
          <div>
            <label className="input-label">Precio</label>
            <AmountInput value={iPrecio} onChange={setIPrecio} />
          </div>
          <div>
            <label className="input-label">Imagen de referencia (URL)</label>
            <input className="input-field" value={iImagen} onChange={e => setIImagen(e.target.value)}
              placeholder="https://..." />
            {iImagen && (
              <div style={{ marginTop: '10px', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '130px', background: 'var(--bg-surface-3)' }}>
                <img src={iImagen} alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
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
              Eliminar producto
            </motion.button>
          )}
        </div>
      </Sheet>

      {/* ─── Sheet: Abonar ─── */}
      <Sheet open={!!abonarSheet} onClose={() => setAbonarSheet(null)} title="Registrar abono">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {abonarSheet && (() => {
            const p       = proyectos.find(x => x.id === abonarSheet)
            const total   = p?.items.reduce((s, i) => s + i.precio, 0) || 0
            const falta   = Math.max(0, total - (p?.ahorroActual || 0))
            return (
              <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {p?.emoji} {p?.nombre}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Faltante: <span style={{ color: 'var(--expense)', fontWeight: 600 }}>{formatCOP(falta)}</span>
                </p>
              </div>
            )
          })()}
          <div>
            <label className="input-label">Monto a abonar</label>
            <AmountInput value={abonoMonto} onChange={setAbonoMonto} autoFocus />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleAbonar} disabled={!abonoMonto}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: abonoMonto ? 'var(--income)' : 'var(--bg-surface-3)',
              color: abonoMonto ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
            }}
          >
            Registrar abono
          </motion.button>
        </div>
      </Sheet>

      <Toast toast={toast} />
    </div>
  )
}

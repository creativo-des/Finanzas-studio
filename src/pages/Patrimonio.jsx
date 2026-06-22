import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcTotalPatrimonio } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

const TIPOS_ACTIVO = ['Casa/Departamento', 'Vehículo', 'Acciones', 'Cuenta de Ahorro', 'Terreno', 'Negocio', 'Otro']

export default function Patrimonio() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()
  const activos = state.personal.patrimonio.activos
  const deudas  = state.personal.deudas
  const { totalActivos, totalPasivos, patrimonioNeto } = calcTotalPatrimonio(activos, deudas)

  // Tendencia mes a mes
  const [tendencia, setTendencia] = useState(null)

  useEffect(() => {
    const now = new Date()
    const mesKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevKey  = `${prevDate.getFullYear()}-${String(prevDate.getMonth()).padStart(2,'0')}`

    try {
      const raw  = localStorage.getItem('df-patrimonio-hist')
      const hist = raw ? JSON.parse(raw) : {}

      if (hist[prevKey] !== undefined) {
        const diff = patrimonioNeto - hist[prevKey]
        setTendencia({ diferencia: diff, prevValor: hist[prevKey] })
      }

      if (hist[mesKey] === undefined) {
        hist[mesKey] = patrimonioNeto
        const sorted = Object.entries(hist).sort(([a], [b]) => a.localeCompare(b)).slice(-24)
        localStorage.setItem('df-patrimonio-hist', JSON.stringify(Object.fromEntries(sorted)))
      }
    } catch { /* storage full */ }
  }, [patrimonioNeto])

  // Add
  const [addOpen, setAddOpen]   = useState(false)
  const [nombre, setNombre]     = useState('')
  const [tipo, setTipo]         = useState('Cuenta de Ahorro')
  const [emoji, setEmoji]       = useState('💰')
  const [valor, setValor]       = useState(0)

  // Edit
  const [editActivo, setEditActivo]   = useState(null)
  const [editNombre, setEditNombre]   = useState('')
  const [editTipo, setEditTipo]       = useState('Cuenta de Ahorro')
  const [editEmoji, setEditEmoji]     = useState('💰')
  const [editValor, setEditValor]     = useState(0)

  const openEdit = (a) => {
    setEditActivo(a)
    setEditNombre(a.nombre)
    setEditTipo(a.tipo)
    setEditEmoji(a.emoji)
    setEditValor(a.valorActual)
  }

  const handleAdd = () => {
    if (!nombre || !valor) return
    dispatch({ type: ACTIONS.ADD_ACTIVO, payload: { nombre, tipo, emoji, valorActual: valor } })
    haptic.success()
    showToast({ message: 'Activo agregado ✓' })
    setAddOpen(false)
    setNombre(''); setValor(0)
  }

  const handleUpdate = () => {
    if (!editNombre || !editValor) return
    dispatch({ type: ACTIONS.UPDATE_ACTIVO, id: editActivo.id, payload: { nombre: editNombre, tipo: editTipo, emoji: editEmoji, valorActual: editValor } })
    haptic.success()
    showToast({ message: 'Activo actualizado ✓' })
    setEditActivo(null)
  }

  const handleDelete = () => {
    dispatch({ type: ACTIONS.DELETE_ACTIVO, id: editActivo.id })
    haptic.light()
    showToast({ message: 'Activo eliminado', type: 'error' })
    setEditActivo(null)
  }

  return (
    <PageLayout header={<PageHeader title="Patrimonio Neto" />}>

      {/* Resumen */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-surface), rgba(245,183,49,0.06))',
          border: '1px solid rgba(245,183,49,0.2)',
          borderRadius: 'var(--radius-2xl)',
          padding: '20px',
        }}>
          <p className="label-uppercase" style={{ marginBottom: '4px', color: 'var(--warning)' }}>Patrimonio neto</p>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '36px',
            color: patrimonioNeto >= 0 ? 'var(--income)' : 'var(--expense)', marginBottom: '8px',
          }}>
            {formatCOP(patrimonioNeto)}
          </p>

          {tendencia ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              {tendencia.diferencia > 0
                ? <TrendingUp size={14} color="var(--income)" />
                : tendencia.diferencia < 0
                  ? <TrendingDown size={14} color="var(--expense)" />
                  : <Minus size={14} color="var(--text-muted)" />
              }
              <span style={{
                fontSize: '13px', fontWeight: 500,
                color: tendencia.diferencia > 0 ? 'var(--income)' : tendencia.diferencia < 0 ? 'var(--expense)' : 'var(--text-muted)',
              }}>
                {tendencia.diferencia > 0 ? '+' : ''}{formatCOP(tendencia.diferencia)} vs mes anterior
              </span>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Se registrará la variación desde el próximo mes
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '2px' }}>Activos</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--income)' }}>
                {formatCOP(totalActivos)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-uppercase" style={{ marginBottom: '2px' }}>Pasivos</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--expense)' }}>
                {formatCOP(totalPasivos)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Activos */}
      <div style={{ padding: '0 20px' }}>
        <p className="label-uppercase" style={{ marginBottom: '12px' }}>Activos</p>
        {activos.length === 0 && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '28px', marginBottom: '8px' }}>💼</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sin activos registrados</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activos.map(a => (
            <motion.div
              key={a.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => openEdit(a)}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{a.emoji}</span>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 500 }}>{a.nombre}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.tipo}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--income)' }}>
                  {formatCOP(a.valorActual)}
                </p>
                <Pencil size={13} color="var(--text-muted)" />
              </div>
            </motion.div>
          ))}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setNombre(''); setValor(0); setEmoji('💰'); setTipo('Cuenta de Ahorro'); setAddOpen(true) }}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
              border: '1px dashed rgba(245,183,49,0.35)', background: 'rgba(245,183,49,0.06)',
              color: 'var(--warning)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px',
            }}
          >
            <Plus size={15} /> Agregar activo
          </motion.button>
        </div>
      </div>

      {/* Pasivos */}
      {deudas.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <p className="label-uppercase" style={{ marginBottom: '12px' }}>Pasivos (deudas)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deudas.map(d => (
              <div key={d.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{d.emoji}</span>
                  <p style={{ fontSize: '15px', fontWeight: 500 }}>{d.tipo}</p>
                </div>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--expense)' }}>
                  -{formatCOP(d.deudaActual)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sheet: nuevo activo */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Nuevo activo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input className="input-field" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ width: '60px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre</label>
              <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Departamento, inversión..." />
            </div>
          </div>
          <div>
            <label className="input-label">Tipo</label>
            <select className="input-field" value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPOS_ACTIVO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Valor actual</label>
            <AmountInput value={valor} onChange={setValor} />
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            disabled={!nombre || !valor}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: nombre && valor ? 'var(--warning)' : 'var(--bg-surface-3)',
              color: nombre && valor ? 'var(--text-inverse)' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Agregar activo
          </motion.button>
        </div>
      </Sheet>

      {/* Sheet: editar activo */}
      <Sheet open={!!editActivo} onClose={() => setEditActivo(null)} title="Editar activo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div>
              <label className="input-label">Ícono</label>
              <input className="input-field" value={editEmoji} onChange={e => setEditEmoji(e.target.value)} style={{ width: '60px', textAlign: 'center', fontSize: '24px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Nombre</label>
              <input className="input-field" value={editNombre} onChange={e => setEditNombre(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Tipo</label>
            <select className="input-field" value={editTipo} onChange={e => setEditTipo(e.target.value)}>
              {TIPOS_ACTIVO.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Valor actual</label>
            <AmountInput value={editValor} onChange={setEditValor} />
          </div>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleUpdate}
            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--warning)', color: 'var(--text-inverse)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Guardar cambios
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={handleDelete}
            style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)', color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer' }}
          >
            Eliminar activo
          </motion.button>
        </div>
      </Sheet>

      <Toast toast={toast} />
    </PageLayout>
  )
}

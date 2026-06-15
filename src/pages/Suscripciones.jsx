import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcSuscripcionesMes } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { diasHastaFecha } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Toggle from '../components/ui/Toggle'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import FAB from '../components/ui/FAB'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'
import { AlertTriangle } from 'lucide-react'

const EMOJIS = ['🎬','🎵','📺','🎮','📰','☁️','🛒','💼','🏋️','📚','🎨','🔒']

export default function Suscripciones() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  const [sheetOpen, setSheetOpen]   = useState(false)
  const [editSub, setEditSub]       = useState(null) // null = add, object = edit

  // Form state (shared for add + edit)
  const [nombre, setNombre]         = useState('')
  const [emoji, setEmoji]           = useState('📺')
  const [monto, setMonto]           = useState(0)
  const [diaPago, setDiaPago]       = useState(1)
  const [categoria, setCategoria]   = useState('personal')
  const [frecuencia, setFrecuencia] = useState('mensual')

  const totalMes  = calcSuscripcionesMes(state.suscripciones)
  const totalAnio = totalMes * 12

  const proximas7dias = state.suscripciones
    .filter(s => s.activa)
    .map(s => ({ ...s, dias: diasHastaFecha(s.diaPago) }))
    .filter(s => s.dias >= 0 && s.dias <= 7)
    .sort((a, b) => a.dias - b.dias)

  const handleToggle = (id) => {
    dispatch({ type: ACTIONS.TOGGLE_SUSCRIPCION, id })
    haptic.light()
  }

  const handleDelete = (id) => {
    dispatch({ type: ACTIONS.DELETE_SUSCRIPCION, id })
    showToast({ message: 'Suscripción eliminada', type: 'error' })
    setSheetOpen(false)
  }

  const openAdd = () => {
    setEditSub(null)
    setNombre(''); setEmoji('📺'); setMonto(0); setDiaPago(1); setCategoria('personal'); setFrecuencia('mensual')
    setSheetOpen(true)
  }

  const openEdit = (sub) => {
    setEditSub(sub)
    setNombre(sub.nombre)
    setEmoji(sub.emoji)
    setMonto(sub.monto)
    setDiaPago(sub.diaPago)
    setCategoria(sub.categoria)
    setFrecuencia(sub.frecuencia)
    setSheetOpen(true)
  }

  const handleSave = () => {
    if (!nombre || !monto) return
    const dia = Math.min(31, Math.max(1, Number(diaPago)))
    const payload = { nombre, emoji, monto, diaPago: dia, categoria, frecuencia, moneda: 'COP' }

    if (editSub) {
      dispatch({ type: ACTIONS.UPDATE_SUSCRIPCION, id: editSub.id, payload })
      haptic.success()
      showToast({ message: `${nombre} actualizada ✓` })
    } else {
      dispatch({ type: ACTIONS.ADD_SUSCRIPCION, payload: { ...payload, metodo: 'credito', color: '#7C6FF7', activa: true } })
      haptic.success()
      showToast({ message: `${nombre} agregada ✓` })
    }
    setSheetOpen(false)
  }

  const personales = state.suscripciones.filter(s => s.categoria === 'personal')
  const estudio    = state.suscripciones.filter(s => s.categoria === 'estudio')

  const SubRow = ({ sub, showBorder }) => (
    <div style={{ borderBottom: showBorder ? '1px solid var(--border)' : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: 'var(--radius-full)',
          background: (sub.color || '#7C6FF7') + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
        }}>
          {sub.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{sub.nombre}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Día {sub.diaPago} · {formatCOP(sub.monto)}/{sub.frecuencia === 'mensual' ? 'mes' : sub.frecuencia}
          </p>
        </div>
        <Toggle checked={sub.activa} onChange={() => handleToggle(sub.id)} />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => openEdit(sub)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
        >
          <Pencil size={14} />
        </motion.button>
      </div>
    </div>
  )

  return (
    <PageLayout header={<PageHeader title="Suscripciones" />}>

      {/* Resumen */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total mensual</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)' }}>
                {formatCOP(totalMes)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="label-uppercase" style={{ marginBottom: '4px' }}>Total anual</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--text-secondary)' }}>
                {formatCOP(totalAnio)}
              </p>
            </div>
          </div>
          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
            {state.suscripciones.filter(s => s.activa).length} activas de {state.suscripciones.length} total
          </p>
        </div>
      </div>

      {/* Alerta cobros próximos */}
      {proximas7dias.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            background: 'var(--warning-dim)', border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <AlertTriangle size={16} color="var(--warning)" />
              <p className="label-uppercase" style={{ color: 'var(--warning)' }}>Cobros en los próximos 7 días</p>
            </div>
            {proximas7dias.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{s.emoji} {s.nombre}</span>
                <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 500 }}>
                  {s.dias === 0 ? 'Hoy' : `En ${s.dias}d`} · {formatCOP(s.monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {state.suscripciones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '32px', marginBottom: '8px' }}>📺</p>
          <p>Agrega tus suscripciones con el +</p>
        </div>
      )}

      {/* Lista personales */}
      {personales.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <p className="label-uppercase" style={{ marginBottom: '12px' }}>Personales</p>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {personales.map((sub, i) => (
              <SubRow key={sub.id} sub={sub} showBorder={i < personales.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Lista estudio */}
      {estudio.length > 0 && (
        <div style={{ padding: '0 20px 16px' }}>
          <p className="label-uppercase" style={{ marginBottom: '12px', color: 'var(--accent)' }}>Estudio</p>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          }}>
            {estudio.map((sub, i) => (
              <SubRow key={sub.id} sub={sub} showBorder={i < estudio.length - 1} />
            ))}
          </div>
        </div>
      )}

      {/* Sheet: agregar / editar suscripción */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editSub ? 'Editar suscripción' : 'Nueva suscripción'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Emoji picker */}
          <div>
            <label className="input-label">Ícono</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {EMOJIS.map(e => (
                <motion.button
                  key={e}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: '40px', height: '40px', fontSize: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${emoji === e ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: emoji === e ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                    cursor: 'pointer',
                  }}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label">Nombre</label>
            <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Netflix, Spotify..." />
          </div>

          <div>
            <label className="input-label">Monto</label>
            <AmountInput value={monto} onChange={setMonto} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="input-label">Día de cobro</label>
              <input className="input-field" type="number" min={1} max={31} value={diaPago} onChange={e => setDiaPago(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Categoría</label>
              <select className="input-field" value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="personal">Personal</option>
                <option value="estudio">Estudio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Frecuencia</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['mensual','trimestral','anual'].map(f => (
                <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setFrecuencia(f)}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${frecuencia === f ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: frecuencia === f ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                    color: frecuencia === f ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '12px', fontWeight: frecuencia === f ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>

          {editSub && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handleDelete(editSub.id)}
              style={{
                width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)',
                color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Eliminar suscripción
            </motion.button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: nombre && monto ? 'var(--accent)' : 'var(--bg-surface-3)',
              color: nombre && monto ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px', cursor: 'pointer',
            }}
          >
            {editSub ? 'Guardar cambios' : 'Agregar suscripción'}
          </motion.button>
        </div>
      </Sheet>

      <Toast toast={toast} />
      <FAB onClick={openAdd} />
    </PageLayout>
  )
}

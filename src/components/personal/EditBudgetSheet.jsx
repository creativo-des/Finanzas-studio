import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import Sheet from '../ui/Sheet'
import AmountInput from '../ui/AmountInput'
import Toggle from '../ui/Toggle'
import { useFinance } from '../../context/FinanceContext'
import { ACTIONS } from '../../context/actions'
import { useHaptic } from '../../hooks/useHaptic'

const NOMBRES_CAT = {
  casa: 'Casa', comida: 'Comida', familia: 'Familia', transporte: 'Transporte',
  viajes: 'Viajes', deudas: 'Deudas', salud: 'Salud', suscripciones: 'Suscripciones',
  gastosAnuales: 'Gastos Anuales', cuidadoPersonal: 'Cuidado Personal',
  entretenimiento: 'Entretenimiento', otros: 'Otros',
}

export default function EditBudgetSheet({ open, onClose, categoriaKey, item, onSuccess }) {
  const { dispatch } = useFinance()
  const haptic = useHaptic()

  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState(0)
  const [fijo, setFijo] = useState(true)
  const [tarjeta, setTarjeta] = useState(true)
  const [hormiga, setHormiga] = useState(false)

  const isEditing = !!item

  useEffect(() => {
    if (open) {
      setNombre(item?.nombre || '')
      setMonto(item?.monto || 0)
      setFijo(item?.fijo ?? true)
      setTarjeta(item?.tarjeta ?? true)
      setHormiga(item?.hormiga ?? false)
    }
  }, [open, item])

  const handleSubmit = () => {
    if (!nombre.trim() || monto <= 0) return

    if (isEditing) {
      dispatch({
        type: ACTIONS.UPDATE_ITEM_CATEGORIA,
        categoria: categoriaKey,
        id: item.id,
        payload: { nombre: nombre.trim(), monto, fijo, tarjeta, hormiga },
      })
    } else {
      dispatch({
        type: ACTIONS.ADD_ITEM_CATEGORIA,
        categoria: categoriaKey,
        payload: { nombre: nombre.trim(), monto, fijo, tarjeta, hormiga },
      })
    }

    haptic.success()
    onSuccess?.()
    onClose()
  }

  const handleDelete = () => {
    if (!isEditing) return
    dispatch({ type: ACTIONS.DELETE_ITEM_CATEGORIA, categoria: categoriaKey, id: item.id })
    haptic.heavy()
    onClose()
  }

  const catLabel = NOMBRES_CAT[categoriaKey] || categoriaKey

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEditing ? `Editar · ${catLabel}` : `Agregar a ${catLabel}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Nombre */}
        <div>
          <label className="input-label">Concepto</label>
          <input
            className="input-field"
            type="text"
            placeholder="Ej: Arriendo, supermercado..."
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            autoFocus={open}
          />
        </div>

        {/* Monto */}
        <div>
          <label className="input-label">Monto mensual</label>
          <AmountInput value={monto} onChange={setMonto} />
        </div>

        {/* Toggles */}
        <div style={{
          background: 'var(--bg-surface-3)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {[
            { label: 'Gasto fijo', desc: 'Se repite cada mes igual', value: fijo, onChange: setFijo },
            { label: 'Se paga con tarjeta', desc: 'Cargo automático o transferencia', value: tarjeta, onChange: setTarjeta },
            { label: 'Gasto hormiga 🐜', desc: 'Pequeño pero frecuente', value: hormiga, onChange: setHormiga },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{row.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{row.desc}</p>
              </div>
              <Toggle checked={row.value} onChange={row.onChange} />
            </div>
          ))}
        </div>

        {/* Botón principal */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
            background: nombre.trim() && monto > 0 ? 'var(--accent)' : 'var(--bg-surface-3)',
            color: nombre.trim() && monto > 0 ? 'white' : 'var(--text-muted)',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
            cursor: nombre.trim() && monto > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          {isEditing ? 'Guardar cambios' : 'Agregar al presupuesto'}
        </motion.button>

        {/* Eliminar (solo si edita) */}
        {isEditing && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleDelete}
            style={{
              width: '100%', padding: '14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--expense-dim)',
              background: 'var(--expense-dim)',
              color: 'var(--expense)',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Trash2 size={16} />
            Eliminar del presupuesto
          </motion.button>
        )}

      </div>
    </Sheet>
  )
}

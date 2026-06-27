import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, CreditCard, Banknote, Wallet } from 'lucide-react'
import Sheet from '../ui/Sheet'
import AmountInput from '../ui/AmountInput'
import { useFinance } from '../../context/FinanceContext'
import { ACTIONS } from '../../context/actions'
import { useHaptic } from '../../hooks/useHaptic'

const CATEGORIAS = [
  { key: 'casa',            emoji: '🏠', label: 'Casa'     },
  { key: 'comida',          emoji: '🥗', label: 'Comida'   },
  { key: 'familia',         emoji: '❤️', label: 'Familia'  },
  { key: 'transporte',      emoji: '🚗', label: 'Transporte'},
  { key: 'viajes',          emoji: '✈️', label: 'Viajes'   },
  { key: 'deudas',          emoji: '🏦', label: 'Deudas'   },
  { key: 'salud',           emoji: '💊', label: 'Salud'    },
  { key: 'suscripciones',   emoji: '📺', label: 'Subs'     },
  { key: 'gastosAnuales',   emoji: '📦', label: 'Anuales'  },
  { key: 'cuidadoPersonal', emoji: '💆', label: 'Personal' },
  { key: 'entretenimiento', emoji: '🎬', label: 'Entret.'  },
  { key: 'otros',           emoji: '💸', label: 'Otros'    },
]

const METODOS = [
  { key: 'Transferencia',   label: 'Transfer.',   icon: ArrowLeftRight, color: '#4F9EF8' },
  { key: 'Tarjeta Crédito', label: 'T. Crédito',  icon: CreditCard,     color: '#7C6FF7' },
  { key: 'Tarjeta Débito',  label: 'T. Débito',   icon: CreditCard,     color: '#2DD4A4' },
  { key: 'Efectivo',        label: 'Efectivo',    icon: Banknote,       color: '#F5B731' },
]

export default function AddTransactionSheet({ open, onClose, onSuccess, mes, anio, transaction, onDelete }) {
  const { state, dispatch } = useFinance()
  const haptic = useHaptic()
  const isEdit = !!transaction

  const [monto, setMonto]         = useState(0)
  const [concepto, setConcepto]   = useState('')
  const [categoria, setCategoria] = useState('otros')
  const [metodo, setMetodo]       = useState('Transferencia')
  const [tarjetaId, setTarjetaId] = useState('')

  // Populate fields when entering edit mode
  useEffect(() => {
    if (transaction) {
      setMonto(transaction.monto)
      setConcepto(transaction.concepto || '')
      setCategoria(transaction.categoria || 'otros')
      setMetodo(transaction.metodo || 'Transferencia')
      setTarjetaId(transaction.tarjetaId || '')
    }
  }, [transaction])

  const tarjetas = state.personal.tarjetas
  const tarjetasCreditoFiltradas = tarjetas.filter(t => t.tipo === 'credito')
  const tarjetasDebitoFiltradas  = tarjetas.filter(t => t.tipo === 'debito')
  const mostrarTarjetas = metodo === 'Tarjeta Crédito' || metodo === 'Tarjeta Débito'
  const tarjetasFiltradas = metodo === 'Tarjeta Crédito' ? tarjetasCreditoFiltradas : tarjetasDebitoFiltradas

  const reset = () => {
    setMonto(0); setConcepto(''); setCategoria('otros')
    setMetodo('Transferencia'); setTarjetaId('')
  }

  const handleClose = () => { if (!isEdit) reset(); onClose() }

  const handleMetodoChange = (m) => {
    setMetodo(m)
    setTarjetaId('')
  }

  const handleSubmit = () => {
    if (!monto || monto <= 0) return

    const syncCard = metodo === 'Tarjeta Débito' && tarjetaId
      ? tarjetas.find(t => t.id === tarjetaId)
      : null

    if (isEdit) {
      const oldSyncCard = transaction.cardSynced && transaction.metodo === 'Tarjeta Débito' && transaction.tarjetaId
        ? tarjetas.find(t => t.id === transaction.tarjetaId)
        : null

      dispatch({
        type: ACTIONS.UPDATE_TRANSACCION,
        id: transaction.id,
        mes, anio,
        payload: { concepto: concepto || 'Sin concepto', categoria, monto, metodo, tarjetaId, cardSynced: !!syncCard },
      })

      if (oldSyncCard && syncCard) {
        if (oldSyncCard.id === syncCard.id) {
          const delta = transaction.monto - monto
          if (delta !== 0) dispatch({ type: ACTIONS.UPDATE_TARJETA, id: syncCard.id, payload: { saldoActual: (syncCard.saldoActual || 0) + delta } })
        } else {
          dispatch({ type: ACTIONS.UPDATE_TARJETA, id: oldSyncCard.id, payload: { saldoActual: (oldSyncCard.saldoActual || 0) + transaction.monto } })
          dispatch({ type: ACTIONS.UPDATE_TARJETA, id: syncCard.id, payload: { saldoActual: (syncCard.saldoActual || 0) - monto } })
        }
      } else if (oldSyncCard && !syncCard) {
        dispatch({ type: ACTIONS.UPDATE_TARJETA, id: oldSyncCard.id, payload: { saldoActual: (oldSyncCard.saldoActual || 0) + transaction.monto } })
      } else if (!oldSyncCard && syncCard) {
        dispatch({ type: ACTIONS.UPDATE_TARJETA, id: syncCard.id, payload: { saldoActual: (syncCard.saldoActual || 0) - monto } })
      }
    } else {
      dispatch({
        type: ACTIONS.ADD_TRANSACCION,
        mes, anio,
        payload: { concepto: concepto || 'Sin concepto', categoria, monto, metodo, tarjetaId, cardSynced: !!syncCard },
      })
      if (syncCard) {
        dispatch({ type: ACTIONS.UPDATE_TARJETA, id: syncCard.id, payload: { saldoActual: (syncCard.saldoActual || 0) - monto } })
      }
    }

    haptic.success()
    if (!isEdit) reset()
    onSuccess?.()
    onClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title={isEdit ? 'Editar gasto' : 'Registrar gasto'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Monto */}
        <div>
          <label className="input-label">Monto</label>
          <AmountInput value={monto} onChange={setMonto} autoFocus={open && !isEdit} />
        </div>

        {/* Concepto */}
        <div>
          <label className="input-label">Concepto</label>
          <input
            className="input-field"
            type="text"
            placeholder="¿En qué gastaste?"
            value={concepto}
            onChange={e => setConcepto(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="input-label">Categoría</label>
          <div className="scroll-x" style={{ padding: '4px 0' }}>
            {CATEGORIAS.map(cat => (
              <motion.button
                key={cat.key}
                whileTap={{ scale: 0.92 }}
                onClick={() => setCategoria(cat.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${categoria === cat.key ? 'var(--accent-border)' : 'var(--border)'}`,
                  background: categoria === cat.key ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                  cursor: 'pointer', minWidth: '60px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                <span style={{ fontSize: '10px', color: categoria === cat.key ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>
                  {cat.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <label className="input-label">Medio de pago</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {METODOS.map(m => {
              const Icon = m.icon
              const active = metodo === m.key
              return (
                <motion.button
                  key={m.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMetodoChange(m.key)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${active ? m.color + '55' : 'var(--border)'}`,
                    background: active ? m.color + '18' : 'var(--bg-surface-3)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: 'var(--radius-sm)',
                    background: active ? m.color + '30' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={15} color={active ? m.color : 'var(--text-muted)'} />
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: active ? 600 : 400,
                    color: active ? m.color : 'var(--text-secondary)',
                    fontFamily: 'Inter, sans-serif', textAlign: 'left', lineHeight: 1.2,
                  }}>
                    {m.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tarjeta específica */}
        {mostrarTarjetas && tarjetasFiltradas.length > 0 && (
          <div>
            <label className="input-label">
              {metodo === 'Tarjeta Crédito' ? 'Tarjeta de crédito' : 'Tarjeta de débito'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tarjetasFiltradas.map(tk => (
                <motion.button
                  key={tk.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTarjetaId(tk.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${tarjetaId === tk.id ? tk.color + '66' : 'var(--border)'}`,
                    background: tarjetaId === tk.id ? tk.color + '22' : 'var(--bg-surface-3)',
                    color: tarjetaId === tk.id ? tk.color : 'var(--text-secondary)',
                    fontSize: '13px', fontWeight: tarjetaId === tk.id ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {tk.nombre}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {mostrarTarjetas && tarjetasFiltradas.length === 0 && (
          <div style={{
            background: 'var(--warning-dim)', border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-md)', padding: '12px 14px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--warning)' }}>
              No tienes tarjetas de {metodo === 'Tarjeta Crédito' ? 'crédito' : 'débito'} registradas.
              Puedes agregar una en Ajustes.
            </p>
          </div>
        )}

        {/* Botones */}
        {isEdit ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onDelete?.(transaction)}
              style={{
                flex: '0 0 auto', padding: '16px 20px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)',
                color: 'var(--expense)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Eliminar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSubmit}
              disabled={!monto || monto <= 0}
              style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
                background: monto > 0 ? 'var(--accent)' : 'var(--bg-surface-3)',
                color: monto > 0 ? 'white' : 'var(--text-muted)',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
                cursor: monto > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Guardar cambios
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none',
              background: monto > 0 ? 'var(--accent)' : 'var(--bg-surface-3)',
              color: monto > 0 ? 'white' : 'var(--text-muted)',
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
              cursor: monto > 0 ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
            }}
          >
            Registrar gasto
          </motion.button>
        )}

      </div>
    </Sheet>
  )
}

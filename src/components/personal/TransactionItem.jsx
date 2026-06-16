import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { formatCOP } from '../../utils/formatCurrency'
import { formatFechaHora } from '../../utils/dateHelpers'

const CAT_EMOJI = {
  casa: '🏠', comida: '🥗', familia: '❤️', transporte: '🚗',
  viajes: '✈️', deudas: '🏦', salud: '💊', suscripciones: '📺',
  gastosAnuales: '📦', cuidadoPersonal: '💆', entretenimiento: '🎬', otros: '💸',
}
const CAT_NOMBRE = {
  casa: 'Casa', comida: 'Comida', familia: 'Familia', transporte: 'Transporte',
  viajes: 'Viajes', deudas: 'Deudas', salud: 'Salud', suscripciones: 'Suscripciones',
  gastosAnuales: 'Gastos Anuales', cuidadoPersonal: 'Cuidado', entretenimiento: 'Entretenim.', otros: 'Otros',
}

export default function TransactionItem({ tx, onDelete, onRequestDelete }) {
  const [swiped, setSwiped] = useState(false)

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Delete button (detrás) */}
      <AnimatePresence>
        {swiped && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSwiped(false); onRequestDelete ? onRequestDelete(tx) : onDelete(tx.id) }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '80px',
              background: 'var(--expense)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <Trash2 size={18} color="white" />
            <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>Eliminar</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: swiped ? -80 : 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -40) setSwiped(true)
          else setSwiped(false)
        }}
        animate={{ x: swiped ? -80 : 0 }}
        whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          minHeight: '64px',
          background: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>
            {CAT_EMOJI[tx.categoria] || '💸'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tx.concepto}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {CAT_NOMBRE[tx.categoria] || 'Otros'} · {tx.metodo}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: 'var(--expense)',
          }}>
            -{formatCOP(tx.monto)}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {formatFechaHora(tx.fecha)}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

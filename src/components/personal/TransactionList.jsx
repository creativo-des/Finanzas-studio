import { useMemo } from 'react'
import { motion } from 'framer-motion'
import TransactionItem from './TransactionItem'
import { formatFecha } from '../../utils/dateHelpers'

export default function TransactionList({ transacciones, onDelete, onRequestDelete, onEdit }) {
  const grouped = useMemo(() => {
    const groups = {}
    for (const tx of transacciones) {
      const key = tx.fecha.split('T')[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(tx)
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [transacciones])

  if (transacciones.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-muted)',
      }}>
        <p style={{ fontSize: '32px', marginBottom: '8px' }}>💸</p>
        <p style={{ fontSize: '15px' }}>Aún no hay gastos este mes</p>
        <p style={{ fontSize: '13px', marginTop: '4px' }}>Toca el + para agregar uno</p>
      </div>
    )
  }

  return (
    <div>
      {grouped.map(([fecha, txs]) => (
        <div key={fecha}>
          <div style={{ padding: '16px 20px 8px' }}>
            <p className="label-uppercase">{formatFecha(fecha)}</p>
          </div>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            margin: '0 20px',
            overflow: 'hidden',
          }}>
            {txs.map((tx, i) => (
              <div key={tx.id}>
                <TransactionItem tx={tx} onDelete={onDelete} onRequestDelete={onRequestDelete} onEdit={onEdit} />
                {i < txs.length - 1 && <div className="divider" style={{ margin: '0 20px' }} />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

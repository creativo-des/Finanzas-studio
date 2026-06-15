import { ArrowLeftRight, CreditCard, Wallet, Banknote } from 'lucide-react'
import { formatCOP } from '../../utils/formatCurrency'

const METODOS_CONFIG = [
  { key: 'Transferencia',    label: 'Transferencia',   icon: ArrowLeftRight, color: '#4F9EF8' },
  { key: 'Tarjeta Crédito',  label: 'Tarjeta Crédito', icon: CreditCard,     color: '#7C6FF7' },
  { key: 'Tarjeta Débito',   label: 'Tarjeta Débito',  icon: CreditCard,     color: '#2DD4A4' },
  { key: 'Efectivo',         label: 'Efectivo',        icon: Banknote,       color: '#F5B731' },
  // Legacy fallback
  { key: 'Tarjeta',          label: 'Tarjeta',         icon: CreditCard,     color: '#7C6FF7' },
]

export default function PaymentMethodsBreakdown({ transacciones }) {
  if (transacciones.length === 0) return null

  const totals = {}
  for (const tx of transacciones) {
    totals[tx.metodo] = (totals[tx.metodo] || 0) + tx.monto
  }

  const totalGeneral = Object.values(totals).reduce((s, v) => s + v, 0)

  const filas = METODOS_CONFIG
    .filter(m => totals[m.key] > 0)
    .map(m => ({ ...m, monto: totals[m.key], pct: (totals[m.key] / totalGeneral) * 100 }))
    .sort((a, b) => b.monto - a.monto)

  if (filas.length === 0) return null

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
      }}>
        <p className="label-uppercase" style={{ marginBottom: '14px' }}>Medios de pago · este mes</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filas.map(fila => {
            const Icon = fila.icon
            return (
              <div key={fila.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
                      background: fila.color + '22',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={fila.color} />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {fila.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '14px',
                      color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatCOP(fila.monto)}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      {fila.pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div style={{ height: '4px', background: 'var(--border-strong)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${fila.pct}%`,
                    background: fila.color, borderRadius: '2px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

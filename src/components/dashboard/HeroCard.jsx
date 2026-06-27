import NumberAnimated from '../ui/NumberAnimated'
import ProgressBar from '../ui/ProgressBar'
import { formatCOP } from '../../utils/formatCurrency'

export default function HeroCard({ disponible, totalIngresos, totalGastos, porcentajeUsado }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, var(--bg-surface), var(--bg-surface-2))',
      border: '1px solid var(--accent-border)',
      borderRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-accent)',
      padding: '24px 20px 20px',
      margin: '0 20px',
    }}>
      <p className="label-uppercase" style={{ marginBottom: '8px' }}>Disponible este mes</p>

      <div style={{ marginBottom: '16px' }}>
        <NumberAnimated
          value={disponible}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: 'var(--text-hero)',
            color: disponible >= 0 ? 'var(--text-primary)' : 'var(--expense)',
            lineHeight: 1,
            display: 'block',
          }}
        />
      </div>

      <ProgressBar percent={porcentajeUsado} size="lg" />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
          Ingresos <strong style={{ color: 'var(--income)' }}>{formatCOP(totalIngresos)}</strong>
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
          Gastos <strong style={{ color: 'var(--expense)' }}>{formatCOP(totalGastos)}</strong>
        </span>
      </div>
    </div>
  )
}

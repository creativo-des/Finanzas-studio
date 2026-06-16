import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../ui/ProgressBar'
import { formatCOP } from '../../utils/formatCurrency'

export default function CategoryCard({ catKey, emoji, nombre, presupuesto, gastado }) {
  const navigate = useNavigate()
  const percent = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
  const overBudget = gastado > presupuesto && presupuesto > 0
  const sinPresupuesto = presupuesto === 0

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/personal?cat=${catKey}`)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${overBudget ? 'rgba(240,107,107,0.3)' : sinPresupuesto ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        opacity: sinPresupuesto && gastado === 0 ? 0.45 : 1,
        position: 'relative',
      }}
    >
      <div>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>{emoji}</span>
        <p style={{
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginTop: '6px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {nombre}
        </p>
      </div>

      <div>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '18px',
          color: overBudget ? 'var(--expense)' : 'var(--text-primary)',
          marginBottom: '2px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatCOP(gastado)}
        </p>
        {presupuesto > 0 ? (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            de {formatCOP(presupuesto)}
          </p>
        ) : (
          <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontStyle: 'italic' }}>
            sin presupuesto
          </p>
        )}
        <ProgressBar percent={percent} color={overBudget ? 'var(--expense)' : undefined} />
      </div>
    </motion.div>
  )
}

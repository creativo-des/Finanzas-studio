import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ProgressBar from '../ui/ProgressBar'
import { formatCOP } from '../../utils/formatCurrency'

export default function CategoryCard({ catKey, emoji, nombre, presupuesto, gastado }) {
  const navigate = useNavigate()
  const percent = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0
  const overBudget = gastado > presupuesto && presupuesto > 0

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/personal?cat=${catKey}`)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${overBudget ? 'rgba(240,107,107,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        height: '130px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        opacity: presupuesto === 0 && gastado === 0 ? 0.5 : 1,
      }}
    >
      <div>
        <span style={{ fontSize: '28px', lineHeight: 1 }}>{emoji}</span>
        <p className="label-uppercase" style={{ marginTop: '6px' }}>{nombre}</p>
      </div>

      <div>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '20px',
          color: 'var(--text-primary)',
          marginBottom: '2px',
        }}>
          {formatCOP(gastado)}
        </p>
        {presupuesto > 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            de {formatCOP(presupuesto)}
          </p>
        )}
        <ProgressBar percent={percent} />
      </div>
    </motion.div>
  )
}

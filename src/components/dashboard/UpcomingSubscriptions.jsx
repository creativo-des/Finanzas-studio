import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { formatCOP } from '../../utils/formatCurrency'
import { diasHastaFecha } from '../../utils/dateHelpers'

export default function UpcomingSubscriptions({ suscripciones }) {
  const navigate = useNavigate()

  const proximas = suscripciones
    .filter(s => s.activa)
    .map(s => ({ ...s, diasRestantes: diasHastaFecha(s.diaPago) }))
    .filter(s => s.diasRestantes >= 0 && s.diasRestantes <= 7)
    .sort((a, b) => a.diasRestantes - b.diasRestantes)

  if (proximas.length === 0) return null

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <p className="label-uppercase">Suscripciones próximas</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/suscripciones')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
        >
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)' }}>Ver todas</span>
          <ChevronRight size={14} color="var(--accent)" />
        </motion.button>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {proximas.map((sub, i) => (
          <div key={sub.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: i < proximas.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>{sub.emoji}</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{sub.nombre}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formatCOP(sub.monto)}
                </p>
              </div>
            </div>
            <span className={`badge ${sub.diasRestantes === 0 ? 'badge-red' : 'badge-amber'}`}>
              {sub.diasRestantes === 0 ? 'Hoy' : `En ${sub.diasRestantes}d`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

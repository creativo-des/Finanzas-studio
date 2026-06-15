import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCOP } from '../../utils/formatCurrency'

const CAT_COLORES = {
  casa: '#7C6FF7', comida: '#4F9EF8', familia: '#2DD4A4',
  transporte: '#F06B6B', viajes: '#F5B731', deudas: '#C084FC',
  salud: '#60C5A8', suscripciones: '#FF7E5F', gastosAnuales: '#A78BFA',
  cuidadoPersonal: '#34D399', entretenimiento: '#FB923C', otros: '#9898B8',
}

const NOMBRES = {
  casa: 'Casa', comida: 'Comida', familia: 'Familia', transporte: 'Transporte',
  viajes: 'Viajes', deudas: 'Deudas', salud: 'Salud', suscripciones: 'Suscripciones',
  gastosAnuales: 'Gastos anuales', cuidadoPersonal: 'Cuidado', entretenimiento: 'Entretenim.', otros: 'Otros',
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: 'var(--bg-surface-2)', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '12px',
    }}>
      <p style={{ color: d.payload.fill, fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
        {formatCOP(d.value)}
      </p>
    </div>
  )
}

export default function CategoryDonutChart({ categorias, transacciones }) {
  const fromTransacciones = transacciones.length > 0
  const totalGastado = transacciones.reduce((s, t) => s + t.monto, 0)

  // Build data from real transactions or from budget as fallback
  const data = Object.entries(categorias)
    .map(([key, cat]) => {
      const value = fromTransacciones
        ? transacciones.filter(t => t.categoria === key).reduce((s, t) => s + t.monto, 0)
        : cat.items.reduce((s, i) => s + i.monto, 0)
      return { name: NOMBRES[key] || key, key, value, emoji: cat.emoji }
    })
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)
  const top5 = data.slice(0, 5)

  if (data.length === 0) return null

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <p className="label-uppercase">Distribución de gastos</p>
          {!fromTransacciones && (
            <span className="badge badge-amber" style={{ fontSize: '9px' }}>Presupuesto</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Donut */}
          <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={CAT_COLORES[entry.key] || '#9898B8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Centro */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
                {fromTransacciones ? 'gastado' : 'presup.'}
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '13px',
                color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', marginTop: '2px',
              }}>
                {formatCOP(total)}
              </p>
            </div>
          </div>

          {/* Leyenda top 5 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {top5.map(d => {
              const pct = total > 0 ? (d.value / total) * 100 : 0
              return (
                <div key={d.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {d.emoji} {d.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ height: '3px', background: 'var(--border-strong)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: CAT_COLORES[d.key] || '#9898B8',
                      borderRadius: '2px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

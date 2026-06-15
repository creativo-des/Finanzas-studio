import { motion } from 'framer-motion'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { ACTIONS } from '../context/actions'
import { calcTotalesPersonal, calcTotalesMes, calcTotalesEstudio } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { nombreMes } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import HeroCard from '../components/dashboard/HeroCard'
import MonthSelector from '../components/dashboard/MonthSelector'
import CategoryGrid from '../components/dashboard/CategoryGrid'
import CategoryDonutChart from '../components/dashboard/CategoryDonutChart'
import PaymentMethodsBreakdown from '../components/dashboard/PaymentMethodsBreakdown'
import UpcomingSubscriptions from '../components/dashboard/UpcomingSubscriptions'
import ProgressBar from '../components/ui/ProgressBar'

function ModeSwitcher() {
  const { mode, switchMode } = useAuth()
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-surface-2)',
      borderRadius: 'var(--radius-full)',
      padding: '3px',
      gap: '2px',
    }}>
      {['personal', 'estudio'].map(m => (
        <motion.button
          key={m}
          whileTap={{ scale: 0.94 }}
          onClick={() => switchMode(m)}
          style={{
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: mode === m ? 'var(--accent)' : 'transparent',
            color: mode === m ? 'white' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: mode === m ? 600 : 400,
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            textTransform: 'capitalize',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {m === 'personal' ? '🏠' : '💼'} {m.charAt(0).toUpperCase() + m.slice(1)}
        </motion.button>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { state, dispatch } = useFinance()
  const { mode } = useAuth()
  const { mesActual, anioActual, nombre } = state.config

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  const handleMesChange = (mes) => {
    dispatch({ type: ACTIONS.SET_MES_ACTUAL, mes, anio: anioActual })
  }

  // ── Modo Estudio ─────────────────────────────────────────────────
  if (mode === 'estudio') {
    const totalesEst = calcTotalesEstudio(state.estudio, mesActual, anioActual)
    const dist = state.estudio.distribucion || {
      diseniador1: { nombre: 'Tú',    porcentaje: 35 },
      diseniador2: { nombre: 'Socia', porcentaje: 35 },
      estudio:     { porcentaje: 30 },
    }
    const montoD1  = Math.round(totalesEst.cobrado * dist.diseniador1.porcentaje / 100)
    const montoD2  = Math.round(totalesEst.cobrado * dist.diseniador2.porcentaje / 100)
    const montoEst = Math.round(totalesEst.cobrado * dist.estudio.porcentaje / 100)

    const ingresosEstudio = state.estudio.ingresos
      .filter(i => i.mes === mesActual && i.anio === anioActual)
      .slice().sort((a, b) => b.monto - a.monto)

    return (
      <PageLayout header={
        <PageHeader
          title="Disegnarus Studio"
          subtitle={`Finanzas · ${nombreMes(mesActual)} ${anioActual}`}
          rightContent={<ModeSwitcher />}
        />
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '4px', paddingBottom: '8px' }}>

          {/* ── Hero: total cobrado ─────────────────────────── */}
          <div style={{ padding: '0 20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(79,158,248,0.14) 0%, rgba(45,212,164,0.08) 100%)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 20px',
            }}>
              <p className="label-uppercase" style={{ marginBottom: '8px' }}>
                Cobrado · {nombreMes(mesActual)}
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700, fontSize: '38px',
                color: 'var(--income)',
                fontVariantNumeric: 'tabular-nums',
                marginBottom: '6px',
              }}>
                {formatCOP(totalesEst.cobrado)}
              </p>
              {totalesEst.pendiente > 0 && (
                <p style={{ fontSize: '13px', color: 'var(--warning)' }}>
                  + {formatCOP(totalesEst.pendiente)} pendiente de cobro
                </p>
              )}
              {totalesEst.cobrado === 0 && totalesEst.pendiente === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Sin ingresos registrados este mes
                </p>
              )}
            </div>
          </div>

          {/* ── KPIs: gastos y utilidad ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '0 20px' }}>
            {[
              { label: 'Gastos del mes',  value: totalesEst.totalGastos, color: 'var(--expense)' },
              { label: 'Utilidad neta',   value: totalesEst.utilidad,    color: totalesEst.utilidad >= 0 ? 'var(--income)' : 'var(--expense)' },
            ].map(kpi => (
              <div key={kpi.label} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--accent-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
              }}>
                <p className="label-uppercase" style={{ marginBottom: '6px' }}>{kpi.label}</p>
                <p style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700, fontSize: '17px', color: kpi.color,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {formatCOP(kpi.value)}
                </p>
              </div>
            ))}
          </div>

          {/* ── Reparto de ingresos ─────────────────────────── */}
          <div style={{ padding: '0 20px' }}>
            <p className="label-uppercase" style={{ marginBottom: '12px' }}>Reparto de ingresos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Diseñador 1', nombre: dist.diseniador1.nombre, pct: dist.diseniador1.porcentaje, monto: montoD1,  color: '#7C6FF7' },
                { label: 'Diseñador 2', nombre: dist.diseniador2.nombre, pct: dist.diseniador2.porcentaje, monto: montoD2,  color: 'var(--accent)' },
                { label: 'Estudio',     nombre: 'Disegnarus Studio',      pct: dist.estudio.porcentaje,     monto: montoEst, color: 'var(--income)' },
              ].map(({ label, nombre: nom, pct, monto, color }) => (
                <div key={label} style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${color === 'var(--accent)' || color === 'var(--income)' ? 'rgba(79,158,248,0.2)' : 'rgba(124,111,247,0.2)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                      {label} · {pct}%
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{nom}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color }}>
                      {formatCOP(monto)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Selector de mes ─────────────────────────────── */}
          <MonthSelector mesActual={mesActual} onSelect={handleMesChange} />

          {/* ── Ingresos del mes ────────────────────────────── */}
          <div style={{ padding: '0 20px' }}>
            <p className="label-uppercase" style={{ marginBottom: '12px' }}>Ingresos del mes</p>
            {ingresosEstudio.length === 0 ? (
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '28px', marginBottom: '8px' }}>💼</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sin ingresos registrados este mes</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ingresosEstudio.map(i => (
                  <div key={i.id} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{i.cliente || 'Sin cliente'}</p>
                      {i.servicio && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.servicio}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--income)' }}>
                        {formatCOP(i.monto)}
                      </p>
                      <span className={`badge ${i.estado === 'cobrado' ? 'badge-green' : i.estado === 'pendiente' ? 'badge-amber' : 'badge-purple'}`}>
                        {i.estado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </PageLayout>
    )
  }

  // ── Modo Personal ────────────────────────────────────────────────
  const totales = calcTotalesPersonal(state)
  const { transacciones, totalGastado } = calcTotalesMes(state, mesActual, anioActual)
  const disponibleReal = totales.totalIngresos - totalGastado
  const porcentajeReal = totales.totalIngresos > 0
    ? Math.min(100, (totalGastado / totales.totalIngresos) * 100)
    : 0

  return (
    <PageLayout
      header={
        <PageHeader
          subtitle={`${nombreMes(mesActual)} ${anioActual}`}
          title={`${saludo}, ${nombre} 👋`}
          rightContent={<ModeSwitcher />}
        />
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '4px', paddingBottom: '8px' }}>

        {/* ── 1. Hero ─────────────────────────────────────── */}
        <HeroCard
          disponible={disponibleReal}
          totalIngresos={totales.totalIngresos}
          totalGastos={totalGastado}
          porcentajeUsado={porcentajeReal}
        />

        {/* ── 2. Balance del mes ──────────────────────────── */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '14px' }}>
              Balance · {nombreMes(mesActual)}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0', marginBottom: '14px' }}>
              {[
                { label: 'Ingresos',   value: totales.totalIngresos, color: 'var(--income)' },
                { label: 'Gastado',    value: totalGastado,          color: 'var(--expense)' },
                { label: 'Disponible', value: disponibleReal,        color: disponibleReal >= 0 ? 'var(--income)' : 'var(--expense)' },
              ].map((kpi, i) => (
                <div key={kpi.label} style={{
                  textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left',
                }}>
                  <p className="label-uppercase" style={{ marginBottom: '4px' }}>{kpi.label}</p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px',
                    color: kpi.color, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {formatCOP(kpi.value)}
                  </p>
                </div>
              ))}
            </div>
            <ProgressBar percent={porcentajeReal} size="lg" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {porcentajeReal.toFixed(0)}% de ingresos usado
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Presupuesto: {formatCOP(totales.totalPresupuesto)}
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. Gráfica distribución ─────────────────────── */}
        <CategoryDonutChart
          categorias={state.personal.presupuesto.categorias}
          transacciones={transacciones}
        />

        {/* ── 4. Medios de pago ───────────────────────────── */}
        <PaymentMethodsBreakdown transacciones={transacciones} />

        {/* ── 5. Selector de mes ──────────────────────────── */}
        <MonthSelector mesActual={mesActual} onSelect={handleMesChange} />

        {/* ── 6. Gastos por categoría ─────────────────────── */}
        <div>
          <div style={{ padding: '0 20px', marginBottom: '12px' }}>
            <p className="label-uppercase">Gastos por categoría</p>
          </div>
          <CategoryGrid
            categorias={state.personal.presupuesto.categorias}
            transacciones={transacciones}
          />
        </div>

        {/* ── 7. Suscripciones próximas ───────────────────── */}
        <UpcomingSubscriptions suscripciones={state.suscripciones} />

      </div>
    </PageLayout>
  )
}

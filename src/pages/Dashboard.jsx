import { motion } from 'framer-motion'
import { useFinance } from '../context/FinanceContext'
import { useAuth } from '../context/AuthContext'
import { ACTIONS } from '../context/actions'
import AppTour from '../components/ui/AppTour'
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


export default function Dashboard() {
  const { state, dispatch } = useFinance()
  const { mode } = useAuth()
  const { mesActual, anioActual, nombre, tourDone } = state.config

  const handleTourDone = () =>
    dispatch({ type: ACTIONS.SET_CONFIG, payload: { tourDone: true } })

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
  const totales = calcTotalesPersonal(state, mesActual, anioActual)
  const { transacciones, totalGastado } = calcTotalesMes(state, mesActual, anioActual)
  const disponibleReal = totales.totalIngresos - totalGastado
  const porcentajeReal = totales.totalIngresos > 0
    ? Math.min(100, (totalGastado / totales.totalIngresos) * 100)
    : 0

  return (
    <>
      {!tourDone && <AppTour onDone={handleTourDone} />}
      <PageLayout
        header={
          <PageHeader
            subtitle={`${nombreMes(mesActual)} ${anioActual}`}
            title={`${saludo}, ${nombre} 👋`}
          />
        }
      >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '4px', paddingBottom: '8px' }}>

        {/* ── 1. Hero (full width) ─────────────────────────── */}
        <HeroCard
          disponible={disponibleReal}
          totalIngresos={totales.totalIngresos}
          totalGastos={totalGastado}
          porcentajeUsado={porcentajeReal}
        />

        {/* ── 2-col: main left / aside right ──────────────── */}
        <div className="dash-cols">

          {/* ── Left: resumen, mes, categorías ──────────────── */}
          <div className="dash-col-main">

            {/* Summary section: alert + tasa ahorro */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Alerta presupuesto > ingresos */}
              {totales.totalPresupuesto > totales.totalIngresos && totales.totalIngresos > 0 && (
                <div style={{
                  background: 'rgba(245,183,49,0.10)',
                  border: '1px solid rgba(245,183,49,0.35)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning)', marginBottom: '2px' }}>
                      Presupuesto excede tus ingresos
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Déficit de {formatCOP(totales.totalPresupuesto - totales.totalIngresos)} — revisa tus categorías
                    </p>
                  </div>
                </div>
              )}

              {/* Tasa de ahorro + ejecución presupuesto */}
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
              }}>
                <p className="label-uppercase" style={{ marginBottom: '12px' }}>
                  Resumen · {nombreMes(mesActual)}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Tasa de ahorro</p>
                    <p style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '24px',
                      color: disponibleReal >= 0 ? 'var(--income)' : 'var(--expense)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {totales.totalIngresos > 0 ? Math.max(0, Math.round((disponibleReal / totales.totalIngresos) * 100)) : 0}%
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Presupuesto usado</p>
                    <p style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '24px',
                      color: totales.totalPresupuesto > 0 && totalGastado > totales.totalPresupuesto ? 'var(--expense)' : 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {totales.totalPresupuesto > 0 ? Math.round((totalGastado / totales.totalPresupuesto) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <ProgressBar percent={totales.totalPresupuesto > 0 ? Math.min(100, (totalGastado / totales.totalPresupuesto) * 100) : 0} size="lg" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Gastado: {formatCOP(totalGastado)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Presupuesto: {formatCOP(totales.totalPresupuesto)}
                  </span>
                </div>
              </div>
            </div>

            {/* Selector de mes (has own padding: 0 20px) */}
            <MonthSelector mesActual={mesActual} onSelect={handleMesChange} />

            {/* Gastos por categoría */}
            <div>
              <div style={{ padding: '0 20px', marginBottom: '12px' }}>
                <p className="label-uppercase">Gastos por categoría</p>
              </div>
              {/* CategoryGrid has own padding: 0 20px */}
              <CategoryGrid
                categorias={state.personal.presupuesto.categorias}
                transacciones={transacciones}
              />
            </div>

          </div>

          {/* ── Right: gráficas y suscripciones (each has own padding: 0 20px) ── */}
          <div className="dash-col-aside">
            <CategoryDonutChart
              categorias={state.personal.presupuesto.categorias}
              transacciones={transacciones}
            />
            <PaymentMethodsBreakdown transacciones={transacciones} />
            <UpcomingSubscriptions suscripciones={state.suscripciones} />
          </div>

        </div>

      </div>
    </PageLayout>
    </>
  )
}

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { calcTotalesMes, calcTotalesPersonal } from '../utils/calculations'
import { formatCOP } from '../utils/formatCurrency'
import { nombreMes, mesAnterior, mesSiguiente } from '../utils/dateHelpers'
import PageLayout from '../components/layout/PageLayout'
import TransactionList from '../components/personal/TransactionList'
import AddTransactionSheet from '../components/personal/AddTransactionSheet'
import CategoryGrid from '../components/dashboard/CategoryGrid'
import FAB from '../components/ui/FAB'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

export default function PersonalMes() {
  const { num } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useFinance()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { toast, showToast } = useToast()

  const mes = num || state.config.mesActual
  const anio = state.config.anioActual

  const totales = calcTotalesPersonal(state, mes, anio)
  const { transacciones, totalGastado } = calcTotalesMes(state, mes, anio)
  const presupuesto = totales.totalPresupuesto
  const disponible = totales.totalIngresos - totalGastado

  const prev = mesAnterior(mes, anio)
  const next = mesSiguiente(mes, anio)

  const handleDelete = (id) => {
    const tx = transacciones.find(t => t.id === id)
    dispatch({ type: ACTIONS.DELETE_TRANSACCION, id, mes, anio })
    if (tx?.cardSynced && tx.metodo === 'Tarjeta Débito' && tx.tarjetaId) {
      const card = state.personal.tarjetas.find(t => t.id === tx.tarjetaId)
      if (card) dispatch({ type: ACTIONS.UPDATE_TARJETA, id: card.id, payload: { saldoActual: (card.saldoActual || 0) + tx.monto } })
    }
    showToast({ message: 'Gasto eliminado', type: 'error' })
  }

  return (
    <PageLayout
      header={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          height: '56px',
          paddingTop: 'env(safe-area-inset-top)',
        }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/personal/mes/${prev.mes}`)}
            style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <ChevronLeft size={24} color="var(--text-secondary)" />
          </motion.button>

          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)' }}>
            {nombreMes(mes)} {anio}
          </h1>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/personal/mes/${next.mes}`)}
            style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <ChevronRight size={24} color="var(--text-secondary)" />
          </motion.button>
        </div>
      }
    >
      {/* KPI trio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '8px 20px 20px' }}>
        {[
          { label: 'Presupuesto', value: presupuesto, color: 'var(--text-primary)' },
          { label: 'Gastado', value: totalGastado, color: 'var(--expense)' },
          { label: 'Disponible', value: disponible, color: disponible >= 0 ? 'var(--income)' : 'var(--expense)' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 10px',
            textAlign: 'center',
          }}>
            <p className="label-uppercase" style={{ fontSize: '9px', marginBottom: '6px' }}>{kpi.label}</p>
            <p style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              color: kpi.color,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCOP(kpi.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Categorías */}
      <div style={{ padding: '0 20px 16px' }}>
        <p className="label-uppercase" style={{ marginBottom: '12px' }}>Por categoría</p>
      </div>
      <CategoryGrid
        categorias={state.personal.presupuesto.categorias}
        transacciones={transacciones}
      />

      {/* Transacciones */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ padding: '0 20px 12px' }}>
          <p className="label-uppercase">Transacciones</p>
        </div>
        <TransactionList transacciones={transacciones} onDelete={handleDelete} />
      </div>

      <Toast toast={toast} />
      <FAB onClick={() => setSheetOpen(true)} />
      <AddTransactionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => showToast({ message: 'Gasto registrado ✓', type: 'success' })}
        mes={mes}
        anio={anio}
      />
    </PageLayout>
  )
}

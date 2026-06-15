import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Download, Upload, RefreshCw } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { seedData } from '../utils/seedData'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'

const Row = ({ label, value, icon: Icon, onClick, color }) => (
  <motion.div
    whileTap={{ backgroundColor: 'var(--bg-surface-2)' }}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      cursor: onClick ? 'pointer' : 'default',
      minHeight: '54px',
    }}
  >
    <span style={{ fontSize: '15px', color: color || 'var(--text-primary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {value && <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{value}</span>}
      {Icon && <Icon size={16} color={color || 'var(--text-muted)'} />}
      {onClick && !Icon && <ChevronRight size={16} color="var(--text-muted)" />}
    </div>
  </motion.div>
)

const SectionCard = ({ children }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: '20px',
  }}>
    {children}
  </div>
)

const Divider = () => <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />

export default function Ajustes() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const [nombre, setNombre] = useState(state.config.nombre)
  const [metaAhorro, setMetaAhorro] = useState(Math.round(state.personal.metaAhorro * 100))
  const [editNombre, setEditNombre] = useState(false)

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `disegnarus-finanzas-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast({ message: 'Datos exportados ✓' })
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result)
          dispatch({ type: ACTIONS.IMPORT_DATA, data })
          showToast({ message: 'Datos importados ✓' })
        } catch {
          showToast({ message: 'Error al importar el archivo', type: 'error' })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleReset = () => {
    if (!window.confirm('¿Resetear los datos del mes actual? Esta acción no se puede deshacer.')) return
    const { mesActual, anioActual } = state.config
    dispatch({
      type: ACTIONS.IMPORT_DATA,
      data: {
        ...state,
        personal: {
          ...state.personal,
          gastosMensuales: {
            ...state.personal.gastosMensuales,
            [anioActual]: {
              ...state.personal.gastosMensuales?.[anioActual],
              [mesActual]: { transacciones: [], totalGastado: 0 },
            },
          },
        },
      },
    })
    showToast({ message: 'Mes reseteado ✓' })
  }

  const saveNombre = () => {
    dispatch({ type: ACTIONS.SET_CONFIG, payload: { nombre } })
    setEditNombre(false)
    showToast({ message: 'Nombre guardado ✓' })
  }

  const saveMetaAhorro = (val) => {
    setMetaAhorro(val)
    dispatch({ type: ACTIONS.SET_META_AHORRO, valor: val / 100 })
  }

  return (
    <PageLayout header={<PageHeader title="Ajustes" />}>
      <div style={{ padding: '0 20px' }}>

        {/* Cuenta */}
        <p className="label-uppercase" style={{ marginBottom: '8px' }}>Cuenta</p>
        <SectionCard>
          <div style={{ padding: '16px' }}>
            <label className="input-label">Nombre</label>
            <input
              className="input-field"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onBlur={saveNombre}
              onKeyDown={e => e.key === 'Enter' && saveNombre()}
            />
          </div>
          <Divider />
          <Row label="Moneda" value="COP" />
        </SectionCard>

        {/* Presupuesto */}
        <p className="label-uppercase" style={{ marginBottom: '8px' }}>Presupuesto</p>
        <SectionCard>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="input-label">Meta de ahorro</label>
              <span style={{ fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--accent)' }}>
                {metaAhorro}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={metaAhorro}
              onChange={e => saveMetaAhorro(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
          </div>
        </SectionCard>

        {/* Datos */}
        <p className="label-uppercase" style={{ marginBottom: '8px' }}>Datos</p>
        <SectionCard>
          <Row label="Exportar datos (JSON)" icon={Download} onClick={handleExport} />
          <Divider />
          <Row label="Importar datos" icon={Upload} onClick={handleImport} />
          <Divider />
          <Row label="Resetear mes actual" icon={RefreshCw} onClick={handleReset} color="var(--warning)" />
        </SectionCard>

        {/* Info */}
        <SectionCard>
          <Row label="Versión" value="1.0.0" />
          <Divider />
          <div style={{ padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Disegnarus Studio · Cali, Colombia · 2025
            </p>
          </div>
        </SectionCard>

      </div>
      <Toast toast={toast} />
    </PageLayout>
  )
}

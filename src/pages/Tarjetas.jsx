import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Wallet, Pencil, Trash2, Plus, Calendar, Percent } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import { formatCOP } from '../utils/formatCurrency'
import { sanitizeText, sanitizeAmount, sanitizePercent, sanitizeDay } from '../utils/sanitize'
import PageLayout from '../components/layout/PageLayout'
import PageHeader from '../components/layout/PageHeader'
import Sheet from '../components/ui/Sheet'
import AmountInput from '../components/ui/AmountInput'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { useHaptic } from '../hooks/useHaptic'

const COLORES = ['#7C6FF7','#4F9EF8','#2DD4A4','#F5B731','#F06B6B','#C084FC','#FB923C','#34D399']

const EMPTY = {
  banco: '', nombre: '', tipo: 'credito',
  limite: 0, saldoActual: 0, tasa: 0, color: '#7C6FF7',
  fechaCorte: 0, fechaPago: 0,
}

function pct(usado, limite) {
  if (!limite) return 0
  return Math.min(100, Math.round((usado / limite) * 100))
}

// ── Tarjeta visual ────────────────────────────────────────────────────
function TarjetaCard({ tk, onClick }) {
  const isCredito = tk.tipo === 'credito'
  const disponible = isCredito ? (tk.limite - tk.saldoActual) : tk.saldoActual
  const usado = isCredito ? tk.saldoActual : 0
  const porcentaje = isCredito ? pct(usado, tk.limite) : 0

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-xl)',
        background: `linear-gradient(135deg, ${tk.color}22 0%, ${tk.color}08 100%)`,
        border: `1px solid ${tk.color}44`,
        padding: '20px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Círculo decorativo */}
      <div style={{
        position: 'absolute', right: '-20px', top: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: `${tk.color}15`,
      }} />

      {/* Fila superior: ícono + nombre */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: `${tk.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCredito
              ? <CreditCard size={20} color={tk.color} />
              : <Wallet size={20} color={tk.color} />}
          </div>
          <div>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              {tk.nombre}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tk.banco}</p>
          </div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 'var(--radius-full)',
          background: `${tk.color}20`, border: `1px solid ${tk.color}44`,
          fontSize: '11px', fontWeight: 600, color: tk.color, textTransform: 'uppercase',
        }}>
          {isCredito ? 'Crédito' : 'Débito'}
        </span>
      </div>

      {/* Monto principal */}
      {isCredito ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Deuda actual</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--expense)' }}>
                {formatCOP(tk.saldoActual)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Disponible</p>
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--income)' }}>
                {formatCOP(disponible)}
              </p>
            </div>
          </div>

          {/* Barra de uso */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cupo: {formatCOP(tk.limite)}</p>
              <p style={{ fontSize: '11px', color: porcentaje > 75 ? 'var(--expense)' : 'var(--text-muted)', fontWeight: 600 }}>
                {porcentaje}% usado
              </p>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${porcentaje}%`, height: '100%', borderRadius: 'var(--radius-full)',
                background: porcentaje > 75 ? 'var(--expense)' : porcentaje > 50 ? 'var(--warning)' : tk.color,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>

          {/* Fechas de pago */}
          {(tk.fechaCorte > 0 || tk.fechaPago > 0) && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {tk.fechaCorte > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} color="var(--text-muted)" />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Corte: día <strong style={{ color: 'var(--text-secondary)' }}>{tk.fechaCorte}</strong>
                  </p>
                </div>
              )}
              {tk.fechaPago > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} color="var(--warning)" />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Pago: día <strong style={{ color: 'var(--warning)' }}>{tk.fechaPago}</strong>
                  </p>
                </div>
              )}
              {tk.tasa > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Percent size={11} color="var(--text-muted)" />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>{tk.tasa}%</strong> EA
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Saldo disponible</p>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '28px', color: tk.color }}>
            {formatCOP(tk.saldoActual)}
          </p>
        </div>
      )}

      {/* Ícono editar */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
        <Pencil size={14} color={`${tk.color}80`} />
      </div>
    </motion.div>
  )
}

// ── Sheet add/edit tarjeta ────────────────────────────────────────────
function TarjetaSheet({ open, onClose, tarjeta, onSave, onDelete }) {
  const [form, setForm] = useState(tarjeta || EMPTY)
  const isEditing = !!tarjeta

  useEffect(() => {
    if (open) setForm(tarjeta || EMPTY)
  }, [open, tarjeta])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const valid = form.banco.trim() && form.nombre.trim()

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEditing ? `Editar ${form.nombre}` : 'Nueva tarjeta'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Tipo */}
        <div>
          <label className="input-label">Tipo</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['credito', 'debito'].map(t => (
              <motion.button key={t} whileTap={{ scale: 0.95 }}
                onClick={() => set('tipo', t)}
                style={{
                  flex: 1, padding: '11px', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${form.tipo === t ? 'var(--accent-border)' : 'var(--border)'}`,
                  background: form.tipo === t ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                  color: form.tipo === t ? 'var(--accent)' : 'var(--text-secondary)',
                  fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: form.tipo === t ? 600 : 400,
                  cursor: 'pointer', textTransform: 'capitalize',
                }}
              >
                {t === 'credito' ? '💳 Crédito' : '💰 Débito'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="input-label">Color</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COLORES.map(c => (
              <motion.button key={c} whileTap={{ scale: 0.88 }}
                onClick={() => set('color', c)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: c, border: `2.5px solid ${form.color === c ? 'white' : 'transparent'}`,
                  cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'box-shadow 0.15s',
                }}
              />
            ))}
          </div>
        </div>

        {/* Banco y nombre */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label className="input-label">Banco</label>
            <input className="input-field" value={form.banco} maxLength={50} onChange={e => set('banco', e.target.value)} placeholder="Av Villas..." />
          </div>
          <div>
            <label className="input-label">Nombre</label>
            <input className="input-field" value={form.nombre} maxLength={50} onChange={e => set('nombre', e.target.value)} placeholder="Mi tarjeta..." />
          </div>
        </div>

        {/* Saldo actual */}
        <div>
          <label className="input-label">{form.tipo === 'credito' ? 'Deuda actual' : 'Saldo disponible'}</label>
          <AmountInput value={form.saldoActual} onChange={v => set('saldoActual', v)} />
        </div>

        {/* Campos solo crédito */}
        {form.tipo === 'credito' && (
          <>
            <div>
              <label className="input-label">Cupo total</label>
              <AmountInput value={form.limite} onChange={v => set('limite', v)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label className="input-label">Día de corte</label>
                <input className="input-field" type="number" min={1} max={31}
                  value={form.fechaCorte || ''}
                  onChange={e => set('fechaCorte', Number(e.target.value))}
                  placeholder="25"
                  style={{ textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px' }}
                />
              </div>
              <div>
                <label className="input-label">Día de pago</label>
                <input className="input-field" type="number" min={1} max={31}
                  value={form.fechaPago || ''}
                  onChange={e => set('fechaPago', Number(e.target.value))}
                  placeholder="10"
                  style={{ textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px' }}
                />
              </div>
              <div>
                <label className="input-label">Tasa E.M. %</label>
                <input className="input-field" type="number" min={0} step={0.1}
                  value={form.tasa || ''}
                  onChange={e => set('tasa', Number(e.target.value))}
                  placeholder="2.6"
                  style={{ textAlign: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px' }}
                />
              </div>
            </div>
          </>
        )}

        {/* Guardar */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => valid && onSave(form)}
          style={{
            width: '100%', padding: '15px', borderRadius: 'var(--radius-md)', border: 'none',
            background: valid ? 'var(--accent)' : 'var(--bg-surface-3)',
            color: valid ? 'white' : 'var(--text-muted)',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '16px',
            cursor: valid ? 'pointer' : 'not-allowed',
          }}
        >
          {isEditing ? 'Guardar cambios' : 'Agregar tarjeta'}
        </motion.button>

        {/* Eliminar */}
        {isEditing && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={onDelete}
            style={{
              width: '100%', padding: '13px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--expense-dim)', background: 'var(--expense-dim)',
              color: 'var(--expense)',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            <Trash2 size={15} /> Eliminar tarjeta
          </motion.button>
        )}

      </div>
    </Sheet>
  )
}

// ── Página principal ──────────────────────────────────────────────────
export default function Tarjetas() {
  const { state, dispatch } = useFinance()
  const { toast, showToast } = useToast()
  const haptic = useHaptic()

  const [sheet, setSheet] = useState({ open: false, tarjeta: null })

  const tarjetas = state.personal.tarjetas || []
  const credito = tarjetas.filter(t => t.tipo === 'credito')
  const debito  = tarjetas.filter(t => t.tipo === 'debito')

  const totalDeuda     = credito.reduce((s, t) => s + (t.saldoActual || 0), 0)
  const totalDisponible = debito.reduce((s, t) => s + (t.saldoActual || 0), 0)

  const openAdd  = () => setSheet({ open: true, tarjeta: null })
  const openEdit = (tk) => setSheet({ open: true, tarjeta: tk })
  const closeSheet = () => setSheet({ open: false, tarjeta: null })

  const handleSave = (form) => {
    const clean = {
      ...form,
      banco:      sanitizeText(form.banco, 50),
      nombre:     sanitizeText(form.nombre, 50),
      saldoActual: sanitizeAmount(form.saldoActual, 0),
      limite:      sanitizeAmount(form.limite, 0),
      tasa:        sanitizePercent(form.tasa, 30),
      fechaCorte:  sanitizeDay(form.fechaCorte),
      fechaPago:   sanitizeDay(form.fechaPago),
    }
    if (!clean.banco || !clean.nombre) return
    if (sheet.tarjeta) {
      dispatch({ type: ACTIONS.UPDATE_TARJETA, id: sheet.tarjeta.id, payload: clean })
      showToast({ message: 'Tarjeta actualizada ✓' })
    } else {
      dispatch({ type: ACTIONS.ADD_TARJETA, payload: clean })
      showToast({ message: 'Tarjeta agregada ✓' })
    }
    haptic.success()
    closeSheet()
  }

  const handleDelete = () => {
    if (!sheet.tarjeta) return
    dispatch({ type: ACTIONS.DELETE_TARJETA, id: sheet.tarjeta.id })
    haptic.heavy()
    showToast({ message: 'Tarjeta eliminada', type: 'error' })
    closeSheet()
  }

  return (
    <PageLayout header={<PageHeader title="Mis tarjetas" subtitle="Resumen financiero" />}>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Resumen rápido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid rgba(240,107,107,0.2)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '6px' }}>Deuda total</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--expense)' }}>
              {formatCOP(totalDeuda)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{credito.length} tarjeta{credito.length !== 1 ? 's' : ''} de crédito</p>
          </div>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid rgba(45,212,164,0.2)',
            borderRadius: 'var(--radius-lg)', padding: '16px',
          }}>
            <p className="label-uppercase" style={{ marginBottom: '6px' }}>En débito</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', color: 'var(--income)' }}>
              {formatCOP(totalDisponible)}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{debito.length} tarjeta{debito.length !== 1 ? 's' : ''} de débito</p>
          </div>
        </div>

        {/* Crédito */}
        {credito.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p className="label-uppercase">Tarjetas de crédito</p>
            <div className="tarjetas-list">
              {credito.map(tk => (
                <TarjetaCard key={tk.id} tk={tk} onClick={() => openEdit(tk)} />
              ))}
            </div>
          </div>
        )}

        {/* Débito */}
        {debito.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p className="label-uppercase">Tarjetas de débito</p>
            <div className="tarjetas-list">
              {debito.map(tk => (
                <TarjetaCard key={tk.id} tk={tk} onClick={() => openEdit(tk)} />
              ))}
            </div>
          </div>
        )}

        {tarjetas.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>💳</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No tienes tarjetas registradas</p>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
            border: '1px dashed rgba(124,111,247,0.35)', background: 'rgba(124,111,247,0.06)',
            color: 'var(--accent)', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px',
          }}
        >
          <Plus size={15} /> Agregar tarjeta
        </motion.button>

      </div>

      <TarjetaSheet
        open={sheet.open}
        onClose={closeSheet}
        tarjeta={sheet.tarjeta}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <Toast toast={toast} />
    </PageLayout>
  )
}

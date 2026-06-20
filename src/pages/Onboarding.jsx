import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import { ACTIONS } from '../context/actions'
import AmountInput from '../components/ui/AmountInput'
import { nombreMes } from '../utils/dateHelpers'

const uid = () => Math.random().toString(36).slice(2, 9)

const CARD_COLORS = ['#7C6FF7','#4F9EF8','#2DD4A4','#F5B731','#F06B6B','#C084FC','#FB923C','#34D399']
const SAVINGS_OPTIONS = [10, 15, 20, 25, 30]

const slide = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, transition: { duration: 0.18 } }),
}

export default function Onboarding() {
  const { state, dispatch } = useFinance()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)

  // Step 1 – ingresos
  const [incomes, setIncomes]   = useState([])
  const [fuente, setFuente]     = useState('')
  const [iMonto, setIMonto]     = useState(0)

  // Step 2 – meta ahorro
  const [metaPct, setMetaPct]       = useState(20)
  const [customPct, setCustomPct]   = useState('')
  const [useCustom, setUseCustom]   = useState(false)

  // Step 3 – tarjetas
  const [cards, setCards]         = useState([])
  const [cNombre, setCNombre]     = useState('')
  const [cBanco, setCBanco]       = useState('')
  const [cTipo, setCTipo]         = useState('debito')
  const [cSaldo, setCSaldo]       = useState(0)
  const [cLimite, setCLimite]     = useState(0)
  const [cColor, setCColor]       = useState('#7C6FF7')

  const mes  = state.config.mesActual
  const anio = state.config.anioActual

  const go = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const addIncome = () => {
    if (!fuente.trim() || !iMonto) return
    setIncomes(p => [...p, { id: uid(), fuente: fuente.trim(), monto: iMonto }])
    setFuente('')
    setIMonto(0)
  }

  const addCard = () => {
    if (!cNombre.trim()) return
    setCards(p => [...p, {
      id: uid(), nombre: cNombre.trim(), banco: cBanco.trim() || 'Banco',
      tipo: cTipo, saldoActual: cSaldo,
      limite: cTipo === 'credito' ? cLimite : 0,
      tasa: 0, color: cColor, fechaCorte: 0, fechaPago: 0,
    }])
    setCNombre(''); setCBanco(''); setCSaldo(0); setCLimite(0); setCColor('#7C6FF7')
  }

  const complete = () => {
    incomes.forEach(inc =>
      dispatch({ type: ACTIONS.ADD_INGRESO_MES, mes, anio, payload: { fuente: inc.fuente, monto: inc.monto } })
    )
    const pct = useCustom ? (parseInt(customPct) || 20) : metaPct
    dispatch({ type: ACTIONS.SET_META_AHORRO, meta: pct / 100 })
    cards.forEach(card => dispatch({ type: ACTIONS.ADD_TARJETA, payload: card }))
    dispatch({ type: ACTIONS.SET_CONFIG, payload: { onboardingDone: true } })
  }

  const STEPS = 4

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: '480px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 0 40px' }}>

        {/* Progress bar */}
        {step > 0 && (
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => go(step - 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}
            >
              <ChevronLeft size={20} />
            </button>
            <div style={{ flex: 1, height: '3px', background: 'var(--bg-surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div
                initial={false}
                animate={{ width: `${(step / (STEPS - 1)) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--accent)', borderRadius: '99px' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {step} / {STEPS - 1}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div key="welcome" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 24px 32px', gap: '32px' }}
            >
              {/* Logo */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '26px',
                  background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 12px 40px rgba(124,111,247,0.4)',
                }}>
                  <span style={{ fontSize: '40px' }}>💜</span>
                </div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.2 }}>
                  Bienvenid@ a tu<br />dashboard financiero
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  En 3 pasos rápidos configuramos todo para que<br />puedas ver tus finanzas con claridad.
                </p>
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '💰', title: 'Ingresos del mes', desc: 'Cuánto ganaste en ' + nombreMes(mes) },
                  { icon: '🎯', title: 'Meta de ahorro',   desc: 'Qué % quieres ahorrar cada mes' },
                  { icon: '💳', title: 'Tarjetas y cuentas', desc: 'Créditos, débitos y cuentas de banco' },
                ].map(f => (
                  <div key={f.title} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                  }}>
                    <span style={{ fontSize: '26px', flexShrink: 0 }}>{f.icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{f.title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => go(1)}
                style={{
                  width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)',
                  border: 'none', background: 'var(--accent)', color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(124,111,247,0.4)',
                }}
              >
                Empezar <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="ingresos" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '20px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ¿Cuánto ganaste en {nombreMes(mes)}?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Agrega todas tus fuentes de ingreso de este mes.
                </p>
              </div>

              {/* Income list */}
              {incomes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {incomes.map(inc => (
                    <div key={inc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: '12px 14px',
                    }}>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{inc.fuente}</p>
                        <p style={{ fontSize: '13px', color: 'var(--income)', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inc.monto)}
                        </p>
                      </div>
                      <button onClick={() => setIncomes(p => p.filter(i => i.id !== inc.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add income form */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="input-label">Fuente de ingreso</label>
                  <input className="input-field" value={fuente} onChange={e => setFuente(e.target.value)}
                    placeholder="Salario, freelance, arriendo..." onKeyDown={e => e.key === 'Enter' && addIncome()} />
                </div>
                <div>
                  <label className="input-label">Monto recibido</label>
                  <AmountInput value={iMonto} onChange={setIMonto} />
                </div>
                <motion.button whileTap={{ scale: 0.96 }} onClick={addIncome}
                  disabled={!fuente.trim() || !iMonto}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: fuente.trim() && iMonto ? 'rgba(45,212,164,0.15)' : 'var(--bg-surface-3)',
                    color: fuente.trim() && iMonto ? 'var(--income)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Plus size={15} /> Agregar ingreso
                </motion.button>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(2)}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                    background: incomes.length > 0 ? 'var(--accent)' : 'var(--bg-surface-3)',
                    color: incomes.length > 0 ? 'white' : 'var(--text-muted)',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {incomes.length > 0 ? 'Continuar' : 'Saltar por ahora'} <ChevronRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="meta" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '24px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ¿Cuánto quieres ahorrar?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  El porcentaje de tus ingresos que quieres destinar al ahorro cada mes.
                </p>
              </div>

              {/* % options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {SAVINGS_OPTIONS.map(pct => (
                  <motion.button key={pct} whileTap={{ scale: 0.94 }}
                    onClick={() => { setMetaPct(pct); setUseCustom(false) }}
                    style={{
                      padding: '18px 8px', borderRadius: 'var(--radius-lg)', border: '2px solid',
                      borderColor: !useCustom && metaPct === pct ? 'var(--accent)' : 'var(--border)',
                      background: !useCustom && metaPct === pct ? 'var(--accent-dim)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: !useCustom && metaPct === pct ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {pct}%
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {pct <= 10 ? 'Básico' : pct <= 15 ? 'Moderado' : pct <= 20 ? 'Recomendado' : pct <= 25 ? 'Bueno' : 'Excelente'}
                    </p>
                  </motion.button>
                ))}
                <motion.button whileTap={{ scale: 0.94 }}
                  onClick={() => setUseCustom(true)}
                  style={{
                    padding: '18px 8px', borderRadius: 'var(--radius-lg)', border: '2px solid',
                    borderColor: useCustom ? 'var(--accent)' : 'var(--border)',
                    background: useCustom ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: useCustom ? 'var(--accent)' : 'var(--text-primary)' }}>
                    Otro
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Personalizar</p>
                </motion.button>
              </div>

              {useCustom && (
                <div>
                  <label className="input-label">Porcentaje personalizado</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" type="number" min={1} max={99} value={customPct}
                      onChange={e => setCustomPct(e.target.value)} placeholder="Ej: 35"
                      style={{ paddingRight: '40px' }} autoFocus />
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '16px' }}>%</span>
                  </div>
                </div>
              )}

              {/* Preview */}
              {incomes.length > 0 && (
                <div style={{
                  background: 'rgba(45,212,164,0.08)', border: '1px solid rgba(45,212,164,0.2)',
                  borderRadius: 'var(--radius-md)', padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Ahorro mensual estimado</p>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--income)' }}>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
                      incomes.reduce((s, i) => s + i.monto, 0) * ((useCustom ? parseInt(customPct) || 20 : metaPct) / 100)
                    )}
                  </p>
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(3)}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                    background: 'var(--accent)', color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  Continuar <ChevronRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="tarjetas" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '20px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Tarjetas y cuentas
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Agrega tus tarjetas de crédito y cuentas de banco. Puedes agregar más después.
                </p>
              </div>

              {/* Cards list */}
              {cards.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cards.map(c => (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: '12px 14px',
                    }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.banco} · {c.tipo}</p>
                      </div>
                      <button onClick={() => setCards(p => p.filter(x => x.id !== c.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add card form */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="input-label">Nombre</label>
                    <input className="input-field" value={cNombre} onChange={e => setCNombre(e.target.value)} placeholder="Ej: Mastercard Oro" />
                  </div>
                  <div>
                    <label className="input-label">Banco</label>
                    <input className="input-field" value={cBanco} onChange={e => setCBanco(e.target.value)} placeholder="Bancolombia..." />
                  </div>
                  <div>
                    <label className="input-label">Tipo</label>
                    <select className="input-field" value={cTipo} onChange={e => setCTipo(e.target.value)}>
                      <option value="debito">Débito / Cuenta</option>
                      <option value="credito">Crédito</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">{cTipo === 'credito' ? 'Saldo actual' : 'Saldo'}</label>
                    <AmountInput value={cSaldo} onChange={setCSaldo} />
                  </div>
                  {cTipo === 'credito' && (
                    <div>
                      <label className="input-label">Cupo total</label>
                      <AmountInput value={cLimite} onChange={setCLimite} />
                    </div>
                  )}
                </div>

                {/* Color picker */}
                <div>
                  <label className="input-label" style={{ marginBottom: '8px' }}>Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CARD_COLORS.map(col => (
                      <button key={col} onClick={() => setCColor(col)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%', background: col,
                          border: `3px solid ${cColor === col ? 'white' : 'transparent'}`,
                          cursor: 'pointer', flexShrink: 0,
                          boxShadow: cColor === col ? `0 0 0 1px ${col}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.96 }} onClick={addCard}
                  disabled={!cNombre.trim()}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: cNombre.trim() ? 'rgba(124,111,247,0.15)' : 'var(--bg-surface-3)',
                    color: cNombre.trim() ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Plus size={15} /> Agregar tarjeta / cuenta
                </motion.button>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={complete}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                    background: 'var(--accent)', color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(124,111,247,0.4)',
                  }}
                >
                  <Check size={17} /> Ir a mi dashboard
                </motion.button>
                {cards.length === 0 && (
                  <button onClick={complete}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', padding: '8px' }}>
                    Saltar — lo agrego después
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

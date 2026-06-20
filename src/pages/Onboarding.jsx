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

/* ── helpers ────────────────────────────────────────────── */
function makeCardNum(name) {
  if (!name) return '•••• •••• •••• ••••'
  const h = Math.abs([...name].reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0))
  const p = (n) => String(1000 + (n % 9000))
  return `${p(h)} ${p(h >> 4)} ${p(h >> 8)} ${p(h >> 12)}`
}

function darkenHex(hex, f) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.floor(r * f)},${Math.floor(g * f)},${Math.floor(b * f)})`
}

/* ── SVG parts ──────────────────────────────────────────── */
function ChipSVG() {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
      <rect width="34" height="26" rx="4" fill="url(#chipG)"/>
      <rect x="1" y="9" width="11" height="8" rx="1" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.7"/>
      <rect x="13" y="1" width="8" height="24" rx="1" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.7"/>
      <rect x="22" y="9" width="11" height="8" rx="1" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.7"/>
      <line x1="0" y1="9" x2="34" y2="9" stroke="rgba(0,0,0,0.18)" strokeWidth="0.7"/>
      <line x1="0" y1="17" x2="34" y2="17" stroke="rgba(0,0,0,0.18)" strokeWidth="0.7"/>
      <defs>
        <linearGradient id="chipG" x1="0" y1="0" x2="34" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D4A843"/>
          <stop offset="45%" stopColor="#F5CC60"/>
          <stop offset="100%" stopColor="#B8882A"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function ContactlessSVG() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <circle cx="2" cy="11" r="2" fill="white" opacity="0.9"/>
      <path d="M6 7 A6 6 0 0 1 6 15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 4.5 A9 9 0 0 1 10 17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M14 2 A12 12 0 0 1 14 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <div style={{ position: 'relative', width: '36px', height: '22px', display: 'inline-block' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#CC2828' }} />
      <div style={{ position: 'absolute', left: '14px', top: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#F79E1B', opacity: 0.88 }} />
    </div>
  )
}

/* ── Flip card (usa las clases CSS de Uiverse) ──────────── */
function FlipCard({ nombre, banco, tipo, color, flipped, onFlip }) {
  const isCredito = tipo === 'credito'
  const dark = darkenHex(color, 0.32)
  const bg = `linear-gradient(135deg, ${color}CC 0%, ${dark} 100%)`

  return (
    <div
      className={`flip-card${flipped ? ' is-flipped' : ''}`}
      style={{ cursor: 'pointer' }}
      onClick={onFlip}
    >
      <div className="flip-card-inner">
        {/* Frente */}
        <div className="flip-card-front" style={{ background: bg }}>
          <div className="chip"><ChipSVG /></div>
          {isCredito && <div className="contactless"><ContactlessSVG /></div>}
          <div className="heading_8264">
            {(banco || 'BANCO').slice(0, 13).toUpperCase()}<br />
            {isCredito ? 'CRÉDITO' : 'DÉBITO'}
          </div>
          <div className="number">{makeCardNum(nombre)}</div>
          {isCredito && <div className="valid_thru">Válida hasta</div>}
          {isCredito && <div className="date_8264">12/28</div>}
          <div className="name">{nombre || 'NOMBRE TITULAR'}</div>
          <div className="logo">
            {isCredito
              ? <MastercardLogo />
              : <span style={{ fontSize: '0.45em', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>DÉBITO</span>
            }
          </div>
        </div>

        {/* Reverso */}
        <div className="flip-card-back" style={{ background: bg }}>
          <div className="strip" />
          {isCredito ? (
            <>
              <div className="mstrip" />
              <div className="sstrip"><p className="code">***</p></div>
            </>
          ) : (
            <div className="back-info">
              <p>{(banco || 'BANCO').toUpperCase()}</p>
              <p>Cuenta de ahorros / corriente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Mini tarjeta para la lista de agregadas ────────────── */
function MiniCard({ card }) {
  const { nombre, banco, tipo, color } = card
  const isCredito = tipo === 'credito'
  const dark = darkenHex(color, 0.32)
  return (
    <div style={{
      width: 148, height: 93, borderRadius: 10, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${color}CC 0%, ${dark} 100%)`,
      color: 'white', padding: '10px 12px',
      boxShadow: `0 4px 16px ${color}50, 0 2px 6px rgba(0,0,0,0.5)`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 21, height: 16, borderRadius: 3, background: 'linear-gradient(135deg, #C8952A, #F0C040)', flexShrink: 0 }} />
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em' }}>
            {(banco || 'BANCO').slice(0, 10).toUpperCase()}
          </p>
          <p style={{ fontSize: 7, opacity: 0.6, marginTop: 1 }}>
            {isCredito ? 'CRÉDITO' : 'DÉBITO'}
          </p>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
        <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2, textTransform: 'uppercase' }}>
          {nombre ? nombre.slice(0, 16) : 'NOMBRE'}
        </p>
        <p style={{ fontSize: 7, opacity: 0.5, fontFamily: 'monospace', letterSpacing: '0.12em' }}>•••• •••• ••••</p>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)', borderRadius: 'inherit', pointerEvents: 'none' }} />
    </div>
  )
}

/* ══ Onboarding ═════════════════════════════════════════ */
export default function Onboarding() {
  const { state, dispatch } = useFinance()
  const [step, setStep] = useState(0)
  const [dir, setDir]   = useState(1)

  const [incomes, setIncomes] = useState([])
  const [fuente, setFuente]   = useState('')
  const [iMonto, setIMonto]   = useState(0)

  const [metaPct, setMetaPct]     = useState(20)
  const [customPct, setCustomPct] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  const [cards, setCards]         = useState([])
  const [cNombre, setCNombre]     = useState('')
  const [cBanco, setCBanco]       = useState('')
  const [cTipo, setCTipo]         = useState('debito')
  const [cSaldo, setCSaldo]       = useState(0)
  const [cLimite, setCLimite]     = useState(0)
  const [cColor, setCColor]       = useState('#7C6FF7')
  const [cardFlipped, setCardFlipped] = useState(false)

  const mes  = state.config.mesActual
  const anio = state.config.anioActual

  const go = (next) => { setDir(next > step ? 1 : -1); setStep(next) }

  const addIncome = () => {
    if (!fuente.trim() || !iMonto) return
    setIncomes(p => [...p, { id: uid(), fuente: fuente.trim(), monto: iMonto }])
    setFuente(''); setIMonto(0)
  }

  const addCard = () => {
    if (!cNombre.trim()) return
    setCards(p => [...p, {
      id: uid(), nombre: cNombre.trim(), banco: cBanco.trim() || 'Banco',
      tipo: cTipo, saldoActual: cSaldo,
      limite: cTipo === 'credito' ? cLimite : 0,
      tasa: 0, color: cColor, fechaCorte: 0, fechaPago: 0,
    }])
    setCNombre(''); setCBanco(''); setCSaldo(0); setCLimite(0)
    setCardFlipped(false)
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: '480px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', paddingBottom: '40px' }}>

        {/* Progress bar */}
        {step > 0 && (
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <button onClick={() => go(step - 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ flex: 1, height: '3px', background: 'var(--bg-surface-3)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div
                initial={false}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', background: 'var(--accent)', borderRadius: '99px' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step} / 3</span>
          </div>
        )}

        <AnimatePresence mode="wait" custom={dir}>

          {/* ══ 0: Bienvenida ══ */}
          {step === 0 && (
            <motion.div key="welcome" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 24px 32px', gap: '28px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '26px',
                  background: 'linear-gradient(135deg, var(--accent), #5B4ED6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(124,111,247,0.4)',
                }}>
                  <span style={{ fontSize: '40px' }}>💜</span>
                </div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '28px', color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.2 }}>
                  Bienvenid@ a tu<br />dashboard financiero
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  En 3 pasos rápidos configuramos todo.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: '💰', title: 'Ingresos del mes',   desc: 'Cuánto ganaste en ' + nombreMes(mes) },
                  { icon: '🎯', title: 'Meta de ahorro',     desc: 'Qué % quieres ahorrar cada mes' },
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
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(1)} style={{
                width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                background: 'var(--accent)', color: 'white',
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 6px 20px rgba(124,111,247,0.4)',
              }}>
                Empezar <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ══ 1: Ingresos ══ */}
          {step === 1 && (
            <motion.div key="ingresos" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '18px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ¿Cuánto ganaste en {nombreMes(mes)}?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Agrega todas tus fuentes de ingreso.</p>
              </div>
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
                  }}>
                  <Plus size={15} /> Agregar ingreso
                </motion.button>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(2)} style={{
                  width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                  background: incomes.length > 0 ? 'var(--accent)' : 'var(--bg-surface-3)',
                  color: incomes.length > 0 ? 'white' : 'var(--text-muted)',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {incomes.length > 0 ? 'Continuar' : 'Saltar por ahora'} <ChevronRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ══ 2: Meta ahorro ══ */}
          {step === 2 && (
            <motion.div key="meta" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '20px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  ¿Cuánto quieres ahorrar?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Porcentaje de tus ingresos destinado al ahorro.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {SAVINGS_OPTIONS.map(pct => (
                  <motion.button key={pct} whileTap={{ scale: 0.94 }}
                    onClick={() => { setMetaPct(pct); setUseCustom(false) }}
                    style={{
                      padding: '18px 8px', borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${!useCustom && metaPct === pct ? 'var(--accent)' : 'var(--border)'}`,
                      background: !useCustom && metaPct === pct ? 'var(--accent-dim)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                    }}>
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
                    padding: '18px 8px', borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${useCustom ? 'var(--accent)' : 'var(--border)'}`,
                    background: useCustom ? 'var(--accent-dim)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', color: useCustom ? 'var(--accent)' : 'var(--text-primary)' }}>Otro</p>
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
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(3)} style={{
                  width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                  background: 'var(--accent)', color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  Continuar <ChevronRight size={17} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ══ 3: Tarjetas ══ */}
          {step === 3 && (
            <motion.div key="tarjetas" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px 32px', gap: '16px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Tarjetas y cuentas
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Toca la tarjeta para girarla · La vista se actualiza en tiempo real
                </p>
              </div>

              {/* ── Preview flip card ── */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FlipCard
                  nombre={cNombre} banco={cBanco} tipo={cTipo}
                  color={cColor} flipped={cardFlipped}
                  onFlip={() => setCardFlipped(f => !f)}
                />
              </div>

              {/* ── Mini cards de las ya agregadas ── */}
              {cards.length > 0 && (
                <div>
                  <p className="label-uppercase" style={{ marginBottom: '8px' }}>
                    Agregadas ({cards.length})
                  </p>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {cards.map(c => (
                      <div key={c.id} style={{ position: 'relative', flexShrink: 0 }}>
                        <MiniCard card={c} />
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setCards(p => p.filter(x => x.id !== c.id))}
                          style={{
                            position: 'absolute', top: '-7px', right: '-7px',
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: 'var(--expense)', border: '2px solid var(--bg-base)',
                            color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          <Trash2 size={9} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Formulario ── */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '14px',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {/* Tipo */}
                <div>
                  <label className="input-label">Tipo</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { key: 'debito',  label: '💰 Débito / Cuenta' },
                      { key: 'credito', label: '💳 Crédito' },
                    ].map(t => (
                      <motion.button key={t.key} whileTap={{ scale: 0.95 }}
                        onClick={() => setCTipo(t.key)}
                        style={{
                          flex: 1, padding: '10px 6px', borderRadius: 'var(--radius-md)',
                          border: `1px solid ${cTipo === t.key ? 'var(--accent-border)' : 'var(--border)'}`,
                          background: cTipo === t.key ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                          color: cTipo === t.key ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '13px', fontWeight: cTipo === t.key ? 600 : 400, cursor: 'pointer',
                        }}>
                        {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Nombre + Banco en grid 2 columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">Nombre</label>
                    <input className="input-field" value={cNombre} onChange={e => setCNombre(e.target.value)}
                      placeholder="Mastercard Oro..." style={{ fontSize: '14px', padding: '11px 12px' }} />
                  </div>
                  <div>
                    <label className="input-label">Banco</label>
                    <input className="input-field" value={cBanco} onChange={e => setCBanco(e.target.value)}
                      placeholder="Bancolombia..." style={{ fontSize: '14px', padding: '11px 12px' }} />
                  </div>
                </div>

                {/* Montos */}
                <div style={{ display: 'grid', gridTemplateColumns: cTipo === 'credito' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <label className="input-label">{cTipo === 'credito' ? 'Saldo actual' : 'Saldo disponible'}</label>
                    <AmountInput value={cSaldo} onChange={setCSaldo} />
                  </div>
                  {cTipo === 'credito' && (
                    <div style={{ minWidth: 0 }}>
                      <label className="input-label">Cupo total</label>
                      <AmountInput value={cLimite} onChange={setCLimite} />
                    </div>
                  )}
                </div>

                {/* Color */}
                <div>
                  <label className="input-label">Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {CARD_COLORS.map(col => (
                      <motion.button key={col} whileTap={{ scale: 0.82 }}
                        onClick={() => setCColor(col)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%', background: col,
                          border: `3px solid ${cColor === col ? 'white' : 'transparent'}`,
                          cursor: 'pointer', flexShrink: 0,
                          boxShadow: cColor === col ? `0 0 0 2px ${col}` : 'none',
                          transition: 'box-shadow 0.15s, border-color 0.15s',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Agregar */}
                <motion.button whileTap={{ scale: 0.96 }} onClick={addCard}
                  disabled={!cNombre.trim()}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: cNombre.trim() ? 'rgba(124,111,247,0.15)' : 'var(--bg-surface-3)',
                    color: cNombre.trim() ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '14px',
                    cursor: cNombre.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}>
                  <Plus size={14} /> Agregar tarjeta / cuenta
                </motion.button>
              </div>

              {/* Finalizar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={complete} style={{
                  width: '100%', padding: '15px', borderRadius: 'var(--radius-lg)', border: 'none',
                  background: 'var(--accent)', color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(124,111,247,0.4)',
                }}>
                  <Check size={17} /> Ir a mi dashboard
                </motion.button>
                {cards.length === 0 && (
                  <button onClick={complete}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px', padding: '6px' }}>
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

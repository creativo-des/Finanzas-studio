import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ChevronRight, ChevronLeft, Check, RotateCcw } from 'lucide-react'
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

/* ── Helpers ────────────────────────────────────────────── */
function lastFourFromName(name) {
  if (!name || !name.trim()) return '••••'
  const h = [...name].reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0)
  return String(Math.abs(h) % 9000 + 1000)
}

/* ── NFC contactless SVG icon ──────────────────────────── */
function ContactlessIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="3.5" cy="10" r="1.8" fill="white" opacity="0.9"/>
      <path d="M7 6.5 A5 5 0 0 1 7 13.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.85"/>
      <path d="M10.5 4.5 A8 8 0 0 1 10.5 15.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.65"/>
      <path d="M14 2.5 A11 11 0 0 1 14 17.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.45"/>
    </svg>
  )
}

/* ── Card front face ───────────────────────────────────── */
function CardFront({ nombre, banco, tipo, color, w, h }) {
  const isCredito = tipo === 'credito'
  const r = w / 280
  const px = (v) => Math.round(v * r)
  const fs = (v) => Math.max(7, px(v))

  return (
    <div style={{
      width: w, height: h, borderRadius: px(16),
      background: `linear-gradient(135deg, ${color}F2 0%, ${color}CC 55%, ${color}88 100%)`,
      boxShadow: `0 12px 40px ${color}55, 0 4px 16px rgba(0,0,0,0.55)`,
      overflow: 'hidden', position: 'relative',
      padding: `${px(18)}px ${px(20)}px`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      color: 'white',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: px(-50), right: px(-30), width: px(160), height: px(160), borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: px(-40), left: px(-20), width: px(120), height: px(120), borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: px(8) }}>
          {/* Chip */}
          <div style={{
            width: px(38), height: px(28), borderRadius: px(5),
            background: 'linear-gradient(135deg, #C8952A 0%, #F0C040 45%, #B88020 100%)',
            boxShadow: `0 ${px(2)}px ${px(6)}px rgba(0,0,0,0.45)`,
            position: 'relative', overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{ position: 'absolute', top: '38%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.28)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '35%', width: '1px', background: 'rgba(0,0,0,0.28)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: '1px', background: 'rgba(0,0,0,0.28)' }} />
          </div>
          {isCredito && <ContactlessIcon size={px(18)} />}
        </div>

        {/* Bank + type */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: fs(12), fontWeight: 800, letterSpacing: '0.07em', textShadow: '0 1px 3px rgba(0,0,0,0.45)', lineHeight: 1 }}>
            {(banco || 'BANCO').slice(0, 14).toUpperCase()}
          </p>
          <p style={{ fontSize: fs(8), letterSpacing: '0.14em', opacity: 0.65, marginTop: px(3), fontWeight: 500, textTransform: 'uppercase' }}>
            {isCredito ? 'Crédito' : 'Débito'}
          </p>
        </div>
      </div>

      {/* Card number */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: fs(14), letterSpacing: '0.22em',
          fontFamily: "'Courier New', 'Lucida Console', monospace",
          fontWeight: 700,
          textShadow: '0 1px 4px rgba(0,0,0,0.45)',
        }}>
          •••• •••• •••• {lastFourFromName(nombre)}
        </p>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
        <div>
          <p style={{ fontSize: fs(7), letterSpacing: '0.12em', opacity: 0.6, marginBottom: px(2), fontWeight: 500 }}>TITULAR</p>
          <p style={{ fontSize: fs(12), fontWeight: 600, letterSpacing: '0.04em', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
            {nombre ? nombre.slice(0, 20).toUpperCase() : 'NOMBRE'}
          </p>
        </div>
        {isCredito && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: fs(7), letterSpacing: '0.12em', opacity: 0.6, marginBottom: px(2), fontWeight: 500 }}>VÁLIDA HASTA</p>
            <p style={{ fontSize: fs(12), fontWeight: 700, letterSpacing: '0.04em' }}>12/28</p>
          </div>
        )}
      </div>

      {/* Gloss overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 50%)', borderRadius: 'inherit', pointerEvents: 'none' }} />
    </div>
  )
}

/* ── Card back face ────────────────────────────────────── */
function CardBack({ banco, tipo, color, w, h }) {
  const isCredito = tipo === 'credito'
  const r = w / 280
  const px = (v) => Math.round(v * r)
  const fs = (v) => Math.max(7, px(v))
  const stripH = px(42)
  const stripTop = px(26)

  return (
    <div style={{
      width: w, height: h, borderRadius: px(16),
      background: `linear-gradient(135deg, ${color}CC 0%, ${color}88 100%)`,
      boxShadow: `0 12px 40px ${color}55, 0 4px 16px rgba(0,0,0,0.55)`,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Magnetic strip */}
      <div style={{
        position: 'absolute', top: stripTop, left: 0, right: 0, height: stripH,
        background: 'repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #0e0e0e 10px, #0e0e0e 20px)',
      }} />

      {isCredito ? (
        <>
          {/* Signature strip + CVV */}
          <div style={{
            position: 'absolute',
            top: stripTop + stripH + px(12),
            left: px(16), right: px(16),
            display: 'flex', alignItems: 'center', gap: px(8),
          }}>
            <div style={{
              flex: 1, height: px(30), borderRadius: px(3),
              background: 'repeating-linear-gradient(45deg, #e8e8e8, #e8e8e8 2px, #fff 2px, #fff 4px)',
            }} />
            <div style={{
              width: px(44), height: px(30), background: 'white',
              borderRadius: px(3), display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}>
              <p style={{ color: '#222', fontSize: fs(11), fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'monospace' }}>•••</p>
            </div>
          </div>
          <p style={{
            position: 'absolute',
            top: stripTop + stripH + px(48),
            right: px(16), fontSize: fs(8), opacity: 0.6, letterSpacing: '0.14em', fontWeight: 600, color: 'white',
          }}>CVV</p>
        </>
      ) : (
        <div style={{ position: 'absolute', bottom: px(18), left: px(20), right: px(16) }}>
          <p style={{ fontSize: fs(11), fontWeight: 700, letterSpacing: '0.1em', opacity: 0.85, color: 'white' }}>
            {(banco || 'BANCO').toUpperCase()}
          </p>
          <p style={{ fontSize: fs(9), opacity: 0.55, marginTop: px(4), letterSpacing: '0.04em', color: 'white' }}>
            CUENTA DE AHORROS / CORRIENTE
          </p>
        </div>
      )}

      {/* Gloss */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
    </div>
  )
}

/* ── Flip card wrapper ──────────────────────────────────── */
function FlipCard({ nombre, banco, tipo, color, flipped, w = 280, h = 176 }) {
  return (
    <div style={{ width: w, height: h, perspective: '1100px', position: 'relative' }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', position: 'relative' }}
      >
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <CardFront nombre={nombre} banco={banco} tipo={tipo} color={color} w={w} h={h} />
        </div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <CardBack banco={banco} tipo={tipo} color={color} w={w} h={h} />
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main Onboarding ────────────────────────────────────── */
export default function Onboarding() {
  const { state, dispatch } = useFinance()
  const [step, setStep] = useState(0)
  const [dir, setDir]   = useState(1)

  // Step 1 – ingresos
  const [incomes, setIncomes] = useState([])
  const [fuente, setFuente]   = useState('')
  const [iMonto, setIMonto]   = useState(0)

  // Step 2 – meta ahorro
  const [metaPct, setMetaPct]     = useState(20)
  const [customPct, setCustomPct] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  // Step 3 – tarjetas
  const [cards, setCards]     = useState([])
  const [cNombre, setCNombre] = useState('')
  const [cBanco, setCBanco]   = useState('')
  const [cTipo, setCTipo]     = useState('debito')
  const [cSaldo, setCSaldo]   = useState(0)
  const [cLimite, setCLimite] = useState(0)
  const [cColor, setCColor]   = useState('#7C6FF7')
  const [cardFlipped, setCardFlipped] = useState(false)

  const mes  = state.config.mesActual
  const anio = state.config.anioActual

  const go = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

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
            <button onClick={() => go(step - 1)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)', display: 'flex' }}>
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

          {/* ── Step 0: Welcome ────────────────────────────── */}
          {step === 0 && (
            <motion.div key="welcome" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 24px 32px', gap: '32px' }}
            >
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: '💰', title: 'Ingresos del mes',    desc: 'Cuánto ganaste en ' + nombreMes(mes) },
                  { icon: '🎯', title: 'Meta de ahorro',      desc: 'Qué % quieres ahorrar cada mes' },
                  { icon: '💳', title: 'Tarjetas y cuentas',  desc: 'Créditos, débitos y cuentas de banco' },
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

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => go(1)}
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

          {/* ── Step 1: Ingresos ───────────────────────────── */}
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
                  }}
                >
                  <Plus size={15} /> Agregar ingreso
                </motion.button>
              </div>

              <div style={{ marginTop: 'auto' }}>
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

          {/* ── Step 2: Meta ahorro ─────────────────────────── */}
          {step === 2 && (
            <motion.div key="meta" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '24px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ¿Cuánto quieres ahorrar?
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Porcentaje de tus ingresos destinado al ahorro cada mes.
                </p>
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
                    padding: '18px 8px', borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${useCustom ? 'var(--accent)' : 'var(--border)'}`,
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

          {/* ── Step 3: Tarjetas ────────────────────────────── */}
          {step === 3 && (
            <motion.div key="tarjetas" custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 32px', gap: '20px' }}
            >
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Tarjetas y cuentas
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Agrega tus tarjetas y cuentas de banco. Puedes agregar más después.
                </p>
              </div>

              {/* Live flip card preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <FlipCard
                  nombre={cNombre} banco={cBanco} tipo={cTipo}
                  color={cColor} flipped={cardFlipped}
                  w={280} h={176}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCardFlipped(f => !f)}
                  style={{
                    background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
                    borderRadius: '99px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500,
                    padding: '6px 14px',
                  }}
                >
                  <RotateCcw size={11} /> {cardFlipped ? 'Ver frente' : 'Ver reverso'}
                </motion.button>
              </div>

              {/* Already-added cards horizontal scroll */}
              {cards.length > 0 && (
                <div>
                  <p className="label-uppercase" style={{ marginBottom: '10px' }}>
                    Tarjetas agregadas ({cards.length})
                  </p>
                  <div style={{
                    display: 'flex', gap: '10px',
                    overflowX: 'auto', paddingBottom: '8px',
                    scrollbarWidth: 'none',
                  }}>
                    {cards.map(c => (
                      <div key={c.id} style={{ position: 'relative', flexShrink: 0 }}>
                        <CardFront nombre={c.nombre} banco={c.banco} tipo={c.tipo} color={c.color} w={148} h={93} />
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={() => setCards(p => p.filter(x => x.id !== c.id))}
                          style={{
                            position: 'absolute', top: '-8px', right: '-8px',
                            width: '22px', height: '22px', borderRadius: '50%',
                            background: 'var(--expense)', border: '2px solid var(--bg-base)',
                            color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={9} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}>
                {/* Tipo toggle */}
                <div>
                  <label className="input-label">Tipo de tarjeta</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { key: 'debito',  icon: '💰', label: 'Débito / Cuenta' },
                      { key: 'credito', icon: '💳', label: 'Crédito' },
                    ].map(t => (
                      <motion.button key={t.key} whileTap={{ scale: 0.95 }}
                        onClick={() => setCTipo(t.key)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)',
                          border: `1px solid ${cTipo === t.key ? 'var(--accent-border)' : 'var(--border)'}`,
                          background: cTipo === t.key ? 'var(--accent-dim)' : 'var(--bg-surface-3)',
                          color: cTipo === t.key ? 'var(--accent)' : 'var(--text-secondary)',
                          fontFamily: 'Inter, sans-serif', fontSize: '13px',
                          fontWeight: cTipo === t.key ? 600 : 400,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        }}
                      >
                        {t.icon} {t.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="input-label">Nombre de tarjeta</label>
                  <input
                    className="input-field"
                    value={cNombre}
                    onChange={e => setCNombre(e.target.value)}
                    placeholder="Ej: Mastercard Oro, Nequi..."
                  />
                </div>

                {/* Banco */}
                <div>
                  <label className="input-label">Banco</label>
                  <input
                    className="input-field"
                    value={cBanco}
                    onChange={e => setCBanco(e.target.value)}
                    placeholder="Bancolombia, Davivienda, Nequi..."
                  />
                </div>

                {/* Amounts */}
                <div style={{ display: 'grid', gridTemplateColumns: cTipo === 'credito' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                  <div>
                    <label className="input-label">
                      {cTipo === 'credito' ? 'Saldo actual (deuda)' : 'Saldo disponible'}
                    </label>
                    <AmountInput value={cSaldo} onChange={setCSaldo} />
                  </div>
                  {cTipo === 'credito' && (
                    <div>
                      <label className="input-label">Cupo total</label>
                      <AmountInput value={cLimite} onChange={setCLimite} />
                    </div>
                  )}
                </div>

                {/* Color swatches */}
                <div>
                  <label className="input-label">Color de tarjeta</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                    {CARD_COLORS.map(col => (
                      <motion.button key={col} whileTap={{ scale: 0.82 }}
                        onClick={() => setCColor(col)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%', background: col,
                          border: `3px solid ${cColor === col ? 'white' : 'transparent'}`,
                          cursor: 'pointer', flexShrink: 0,
                          boxShadow: cColor === col ? `0 0 0 2px ${col}` : 'none',
                          transition: 'box-shadow 0.15s, border-color 0.15s',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Add button */}
                <motion.button whileTap={{ scale: 0.96 }} onClick={addCard}
                  disabled={!cNombre.trim()}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: cNombre.trim() ? 'rgba(124,111,247,0.15)' : 'var(--bg-surface-3)',
                    color: cNombre.trim() ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: 600, fontSize: '14px',
                    cursor: cNombre.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <Plus size={15} /> Agregar tarjeta / cuenta
                </motion.button>
              </div>

              {/* Finish */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={complete}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 'var(--radius-lg)', border: 'none',
                    background: 'var(--accent)', color: 'white',
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px',
                    cursor: 'pointer',
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

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'

const SLIDES = [
  {
    emoji: '💜',
    title: 'Bienvenido a tu\ndashboard financiero',
    desc: 'Controla todo tu dinero desde aquí: lo que entra, lo que sale y hacia dónde va cada peso.',
    color: '#7C6FF7',
  },
  {
    emoji: '📊',
    title: 'Tu resumen\nen el Dashboard',
    desc: 'La pantalla principal muestra tus ingresos, gastos del mes y el dinero que te queda disponible.',
    color: '#4F9EF8',
    hint: '→ Ícono de inicio en la barra inferior',
  },
  {
    emoji: '💸',
    title: 'Registra cada\ngasto al momento',
    desc: 'En Finanzas Personales toca "+ Agregar gasto" después de cada compra para llevar el control exacto.',
    color: '#F06B6B',
    hint: '→ Ícono de persona en la barra inferior',
  },
  {
    emoji: '🎯',
    title: 'Planifica tu\npresupuesto mensual',
    desc: 'Define cuánto quieres gastar en cada categoría (Casa, Comida, Transporte…) para no pasarte.',
    color: '#2DD4A4',
    hint: '→ Menú hamburguesa → Presupuesto',
  },
  {
    emoji: '💳',
    title: 'Gestiona tus\ntarjetas y cuentas',
    desc: 'Registra tus tarjetas de crédito y débito para ver saldos, cupos y movimientos en un solo lugar.',
    color: '#C084FC',
    hint: '→ Ícono de tarjeta en la barra inferior',
  },
]

export default function AppTour({ onDone }) {
  const [slide, setSlide] = useState(0)
  const [dir, setDir]     = useState(1)

  const s = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const goNext = () => {
    if (isLast) { onDone(); return }
    setDir(1)
    setSlide(i => i + 1)
  }

  const goPrev = () => {
    if (slide === 0) return
    setDir(-1)
    setSlide(i => i - 1)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(8,8,16,0.97)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px 48px',
    }}>

      {/* Skip */}
      <button onClick={onDone} style={{
        position: 'absolute', top: '20px', right: '20px',
        background: 'var(--bg-surface-2)', border: '1px solid var(--border)',
        borderRadius: '999px', padding: '8px 14px',
        color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <X size={13} /> Saltar
      </button>

      {/* Slide */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={slide}
          custom={dir}
          initial={{ opacity: 0, x: dir > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
          exit={{ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.18 } }}
          style={{
            width: '100%', maxWidth: '340px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '24px', textAlign: 'center',
          }}
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: 0.1, duration: 0.35, type: 'spring', damping: 14 } }}
            style={{
              width: '100px', height: '100px', borderRadius: '30px',
              background: `${s.color}18`,
              border: `2px solid ${s.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '52px',
              boxShadow: `0 16px 48px ${s.color}28`,
            }}
          >
            {s.emoji}
          </motion.div>

          {/* Text */}
          <div>
            <h2 style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800,
              fontSize: '26px', color: 'var(--text-primary)',
              lineHeight: 1.2, marginBottom: '14px', whiteSpace: 'pre-line',
            }}>
              {s.title}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              {s.desc}
            </p>
            {s.hint && (
              <p style={{
                marginTop: '14px', fontSize: '12px', fontWeight: 600,
                color: s.color, letterSpacing: '0.02em',
              }}>
                {s.hint}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '40px' }}>
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => { setDir(i > slide ? 1 : -1); setSlide(i) }}
            animate={{ width: i === slide ? 22 : 7 }}
            transition={{ duration: 0.25 }}
            style={{
              height: '7px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: i === slide ? s.color : 'var(--border-strong)',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div style={{ marginTop: '28px', width: '100%', maxWidth: '340px', display: 'flex', gap: '10px' }}>
        {slide > 0 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={goPrev}
            style={{
              padding: '15px 20px', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)', background: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            ←
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={goNext}
          style={{
            flex: 1, padding: '15px', borderRadius: 'var(--radius-lg)', border: 'none',
            background: s.color, color: 'white',
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: `0 6px 24px ${s.color}45`,
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          {isLast ? '¡Empezar!' : <>Siguiente <ChevronRight size={18} /></>}
        </motion.button>
      </div>
    </div>
  )
}

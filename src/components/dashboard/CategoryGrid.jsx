import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'
import { calcTotalesCategoriaMes } from '../../utils/calculations'

const NOMBRES = {
  casa: 'Casa', comida: 'Comida', familia: 'Familia', transporte: 'Transporte',
  viajes: 'Viajes', deudas: 'Deudas', salud: 'Salud', suscripciones: 'Suscripciones',
  gastosAnuales: 'Gastos Anuales', cuidadoPersonal: 'Cuidado', entretenimiento: 'Entretenim.', otros: 'Otros',
}

const listContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
}

const listItem = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
}

export default function CategoryGrid({ categorias, transacciones = [] }) {
  return (
    <motion.div
      variants={listContainer}
      initial="initial"
      animate="animate"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '0 20px',
      }}
    >
      {Object.entries(categorias).map(([key, cat]) => {
        const presupuesto = cat.items.reduce((s, i) => s + i.monto, 0)
        const gastado = calcTotalesCategoriaMes(transacciones, key)

        return (
          <motion.div key={key} variants={listItem}>
            <CategoryCard
              catKey={key}
              emoji={cat.emoji}
              nombre={NOMBRES[key] || key}
              presupuesto={presupuesto}
              gastado={gastado}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

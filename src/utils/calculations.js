export const calcTotalesPersonal = (state, mes, anio) => {
  const ingresosMes = state.personal.ingresosMensuales?.[anio]?.[mes] || []
  const totalIngresos = ingresosMes.reduce((s, i) => s + i.monto, 0)

  // duracionMeses support: monthly cost = monto / duracionMeses
  const totalPresupuesto = Object.values(state.personal.presupuesto.categorias)
    .reduce((s, cat) => {
      const catBudget = cat.presupuesto != null
        ? cat.presupuesto
        : cat.items.reduce((cs, i) => cs + i.monto / (i.duracionMeses || 1), 0)
      return s + catBudget
    }, 0)

  const disponible = totalIngresos - totalPresupuesto
  const porcentajeUsado = totalIngresos > 0 ? (totalPresupuesto / totalIngresos) * 100 : 0
  const metaCumplida = disponible >= totalIngresos * (state.personal.metaAhorro || 0)

  return { totalIngresos, totalPresupuesto, disponible, porcentajeUsado, metaCumplida }
}

export const calcMontoCatMensual = (cat) => {
  if (cat.presupuesto != null) return cat.presupuesto
  return cat.items.reduce((s, i) => s + i.monto / (i.duracionMeses || 1), 0)
}

export const calcTotalesMes = (state, mes, anio) => {
  const data = state.personal.gastosMensuales?.[anio]?.[mes]
  if (!data) return { totalGastado: 0, transacciones: [] }

  const totalGastado = data.transacciones.reduce((s, t) => s + t.monto, 0)
  return { totalGastado, transacciones: data.transacciones }
}

export const calcTotalesCategoriaMes = (transacciones, categoria) =>
  transacciones.filter(t => t.categoria === categoria).reduce((s, t) => s + t.monto, 0)

export const calcTotalDeudas = (deudas) =>
  deudas.reduce((s, d) => s + d.deudaActual, 0)

export const calcTotalPatrimonio = (activos, deudas) => {
  const totalActivos = activos.reduce((s, a) => s + a.valorActual, 0)
  const totalPasivos = calcTotalDeudas(deudas)
  return { totalActivos, totalPasivos, patrimoniNeto: totalActivos - totalPasivos }
}

export const calcSuscripcionesMes = (suscripciones) =>
  Math.round(suscripciones
    .filter(s => s.activa)
    .reduce((s, sub) => {
      if (sub.frecuencia === 'anual') return s + sub.monto / 12
      if (sub.frecuencia === 'trimestral') return s + sub.monto / 3
      return s + sub.monto
    }, 0))

export const calcAmortizacion = (monto, tasaMensual, plazo) => {
  if (tasaMensual === 0) return monto / plazo
  const r = tasaMensual / 100
  return monto * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1)
}

export const calcTotalesEstudio = (estudio, mes, anio) => {
  const ingresosMes = estudio.ingresos.filter(i => i.mes === mes && i.anio === anio)
  const gastosMes   = estudio.gastos.filter(g => g.mes === mes && g.anio === anio)
  const cobrado     = ingresosMes.filter(i => i.estado === 'cobrado' || i.estado === 'parcial').reduce((s, i) => s + i.monto, 0)
  const pendiente   = ingresosMes.filter(i => i.estado === 'pendiente').reduce((s, i) => s + i.monto, 0)
  const totalGastos = gastosMes.reduce((s, g) => s + g.monto, 0)
  const utilidad    = cobrado - totalGastos
  return { cobrado, pendiente, totalGastos, utilidad }
}

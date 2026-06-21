export const seedData = {
  personal: {
    ingresosMensuales: {},
    presupuesto: {
      categorias: {
        casa:            { emoji: '🏠', nombre: 'Casa',            items: [] },
        comida:          { emoji: '🥗', nombre: 'Comida',          items: [] },
        familia:         { emoji: '❤️', nombre: 'Familia',         items: [] },
        transporte:      { emoji: '🚗', nombre: 'Transporte',      items: [] },
        viajes:          { emoji: '✈️', nombre: 'Viajes',          items: [] },
        deudas:          { emoji: '🏦', nombre: 'Deudas',          items: [] },
        salud:           { emoji: '💊', nombre: 'Salud',           items: [] },
        suscripciones:   { emoji: '📺', nombre: 'Suscripciones',   items: [] },
        gastosAnuales:   { emoji: '📦', nombre: 'Gastos Anuales',  items: [] },
        cuidadoPersonal: { emoji: '💆', nombre: 'Cuidado Personal',items: [] },
        entretenimiento: { emoji: '🎬', nombre: 'Entretenimiento', items: [] },
        otros:           { emoji: '💸', nombre: 'Otros',           items: [] },
      },
    },
    gastosMensuales: {
      '2025': {
        '01': { transacciones: [], totalGastado: 0 },
        '02': { transacciones: [], totalGastado: 0 },
        '03': { transacciones: [], totalGastado: 0 },
        '04': { transacciones: [], totalGastado: 0 },
        '05': { transacciones: [], totalGastado: 0 },
        '06': { transacciones: [], totalGastado: 0 },
        '07': { transacciones: [], totalGastado: 0 },
        '08': { transacciones: [], totalGastado: 0 },
        '09': { transacciones: [], totalGastado: 0 },
        '10': { transacciones: [], totalGastado: 0 },
        '11': { transacciones: [], totalGastado: 0 },
        '12': { transacciones: [], totalGastado: 0 },
      },
    },
    tarjetas: [],
    deudas: [],
    metas: [],
    patrimonio: { activos: [] },
    metaAhorro: 0.20,
  },

  estudio: {
    nombre: 'Disegnarus Studio',
    ingresos: [],
    gastos: [],
    presupuestoMensual: 0,
    categorias: ['Software', 'Marketing', 'Equipos', 'Servicios', 'Operaciones', 'Nómina', 'Otros'],
    distribucion: {
      diseniador1: { nombre: 'Tú', porcentaje: 35 },
      diseniador2: { nombre: 'Socia', porcentaje: 35 },
      estudio:     { porcentaje: 30 },
    },
  },

  suscripciones: [],

  cotizaciones: [],

  config: {
    moneda: 'COP',
    nombre: 'Usuario',
    tema: 'dark',
    mesActual: '06',
    anioActual: '2026',
    onboardingDone: false,
    tourDone: false,
    dataVersion: 2,
  },
}

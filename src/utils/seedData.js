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
        '01': { transacciones: [] },
        '02': { transacciones: [] },
        '03': { transacciones: [] },
        '04': { transacciones: [] },
        '05': { transacciones: [] },
        '06': { transacciones: [] },
        '07': { transacciones: [] },
        '08': { transacciones: [] },
        '09': { transacciones: [] },
        '10': { transacciones: [] },
        '11': { transacciones: [] },
        '12': { transacciones: [] },
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
    mesActual: String(new Date().getMonth() + 1).padStart(2, '0'),
    anioActual: String(new Date().getFullYear()),
    onboardingDone: false,
    tourDone: false,
    dataVersion: 2,
  },
}

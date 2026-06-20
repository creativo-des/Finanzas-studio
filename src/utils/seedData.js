export const seedData = {
  personal: {
    ingresosMensuales: {},
    presupuesto: {
      categorias: {
        casa: {
          emoji: '🏠',
          nombre: 'Casa',
          items: [
            { id: 'c1', nombre: 'Renta / Hipoteca',  fijo: true,  tarjeta: false, hormiga: false, monto: 800000 },
            { id: 'c2', nombre: 'Mantenimiento',     fijo: true,  tarjeta: true,  hormiga: false, monto: 50000  },
          ],
        },
        comida: {
          emoji: '🥗',
          nombre: 'Comida',
          items: [
            { id: 'co1', nombre: 'Despensa',     fijo: true,  tarjeta: true, hormiga: false, monto: 400000 },
            { id: 'co2', nombre: 'Restaurantes', fijo: false, tarjeta: true, hormiga: true,  monto: 200000 },
            { id: 'co3', nombre: 'Cafés',        fijo: false, tarjeta: true, hormiga: true,  monto: 60000  },
            { id: 'co4', nombre: 'Pan dulce',    fijo: false, tarjeta: true, hormiga: true,  monto: 20000  },
          ],
        },
        familia: {
          emoji: '❤️',
          nombre: 'Familia',
          items: [
            { id: 'f1', nombre: 'Colegiaturas', fijo: true, tarjeta: true, hormiga: false, monto: 300000 },
          ],
        },
        transporte: {
          emoji: '🚗',
          nombre: 'Transporte',
          items: [
            { id: 't1', nombre: 'Gasolina',       fijo: false, tarjeta: true, hormiga: false, monto: 150000 },
            { id: 't2', nombre: 'Lavado de auto', fijo: false, tarjeta: true, hormiga: false, monto: 25000  },
          ],
        },
        viajes: { emoji: '✈️', nombre: 'Viajes', items: [] },
        deudas: {
          emoji: '🏦',
          nombre: 'Deudas',
          items: [
            { id: 'd1', nombre: 'Crédito de auto', fijo: true, tarjeta: true, hormiga: false, monto: 502849 },
          ],
        },
        salud: { emoji: '💊', nombre: 'Salud', items: [] },
        suscripciones: {
          emoji: '📺',
          nombre: 'Suscripciones',
          items: [
            { id: 's1', nombre: 'Netflix', fijo: false, tarjeta: true, hormiga: true, monto: 24900 },
            { id: 's2', nombre: 'Spotify', fijo: false, tarjeta: true, hormiga: true, monto: 17900 },
            { id: 's3', nombre: 'Max',     fijo: false, tarjeta: true, hormiga: true, monto: 19900 },
          ],
        },
        gastosAnuales: {
          emoji: '📦',
          nombre: 'Gastos Anuales',
          items: [
            { id: 'ga1', nombre: 'Seguro de gastos médicos', fijo: true, tarjeta: true, hormiga: false, monto: 80000 },
          ],
        },
        cuidadoPersonal: { emoji: '💆', nombre: 'Cuidado Personal', items: [] },
        entretenimiento:  { emoji: '🎬', nombre: 'Entretenimiento', items: [] },
        otros: {
          emoji: '💸',
          nombre: 'Otros',
          items: [
            { id: 'o1', nombre: 'Plan de internet de celular', fijo: true,  tarjeta: true,  hormiga: false, monto: 55000 },
            { id: 'o2', nombre: 'Compra de libros',            fijo: false, tarjeta: true,  hormiga: true,  monto: 40000 },
            { id: 'o3', nombre: 'Croquetas de la mascota',     fijo: true,  tarjeta: true,  hormiga: false, monto: 85000 },
            { id: 'o4', nombre: 'Baño de mascota',             fijo: true,  tarjeta: true,  hormiga: false, monto: 30000 },
            { id: 'o5', nombre: 'Clases de violín',            fijo: false, tarjeta: false, hormiga: true,  monto: 120000 },
          ],
        },
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

  config: {
    moneda: 'COP',
    nombre: 'Usuario',
    tema: 'dark',
    mesActual: '06',
    anioActual: '2026',
    onboardingDone: false,
  },
}

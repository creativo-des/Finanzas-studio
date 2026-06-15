export const seedData = {
  personal: {
    ingresos: [
      { id: '1', nombre: 'Salario mensual (neto)', tipo: 'fijo', monto: 1800000, activo: true },
      { id: '2', nombre: 'Disegnarus', tipo: 'variable', monto: 50000, activo: true },
    ],
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
    tarjetas: [
      { id: 'tk1', banco: 'Av Villas', nombre: 'Crédito Av Auteco', tipo: 'credito', limite: 3600000, saldoActual: 1200000, tasa: 2.6, color: '#7C6FF7', fechaCorte: 25, fechaPago: 10 },
      { id: 'tk2', banco: 'Falabella', nombre: 'Crédito Falabella', tipo: 'credito', limite: 500000,  saldoActual: 85000,   tasa: 1.9, color: '#4F9EF8', fechaCorte: 20, fechaPago: 5  },
      { id: 'tk3', banco: 'Lulo Bank', nombre: 'Débito Lulo',       tipo: 'debito',  limite: 0,       saldoActual: 350000,  tasa: 0,   color: '#2DD4A4', fechaCorte: 0,  fechaPago: 0  },
      { id: 'tk4', banco: 'Nequi',     nombre: 'Nequi',             tipo: 'debito',  limite: 0,       saldoActual: 80000,   tasa: 0,   color: '#F5B731', fechaCorte: 0,  fechaPago: 0  },
    ],
    deudas: [
      { id: 'deu1', tipo: 'Tecnología', emoji: '💻', deudaInicial: 10100000, deudaActual: 9786702, mensualidad: 502849, completado: 3.1 },
    ],
    metas: [
      { id: 'meta1', nombre: 'Compra importante', emoji: '💰', ahorroActual: 0, mesesPlan: 18, tasaInteres: 10, metaTotal: 20000000, mensualidadNecesaria: 1034470 },
      { id: 'meta2', nombre: 'Vacaciones',        emoji: '🏖️', ahorroActual: 0, mesesPlan: 12, tasaInteres: 10, metaTotal: 4500000,  mensualidadNecesaria: 358121  },
    ],
    patrimonio: {
      activos: [
        { id: 'pa1', tipo: 'Casa/Departamento', emoji: '🏠', nombre: 'Depa Calle 123, Colonia ABC', valorActual: 250000000 },
        { id: 'pa2', tipo: 'Acciones',          emoji: '📈', nombre: 'Portafolio 1',                valorActual: 11500000  },
        { id: 'pa3', tipo: 'Terreno',           emoji: '🌳', nombre: 'Terreno de la abuela',        valorActual: 30000000  },
        { id: 'pa4', tipo: 'Cuenta de Ahorro',  emoji: '💰', nombre: 'Ahorro en Cetes',             valorActual: 4500000   },
        { id: 'pa5', tipo: 'Cuenta de Ahorro',  emoji: '💰', nombre: 'Fondo de emergencia',         valorActual: 3400000   },
      ],
    },
    metaAhorro: 0.25,
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

  suscripciones: [
    { id: 'sub1', nombre: 'Netflix', emoji: '🎬', monto: 24900, moneda: 'COP', frecuencia: 'mensual', diaPago: 15, categoria: 'personal', metodo: 'credito', tarjetaId: 'tk1', activa: true, color: '#E50914' },
    { id: 'sub2', nombre: 'Spotify', emoji: '🎵', monto: 17900, moneda: 'COP', frecuencia: 'mensual', diaPago: 15, categoria: 'personal', metodo: 'credito', tarjetaId: 'tk1', activa: true, color: '#1DB954' },
    { id: 'sub3', nombre: 'Max',     emoji: '📺', monto: 19900, moneda: 'COP', frecuencia: 'mensual', diaPago: 10, categoria: 'personal', metodo: 'credito', tarjetaId: 'tk1', activa: true, color: '#002BE7' },
  ],

  config: {
    moneda: 'COP',
    nombre: 'Disegnarus',
    tema: 'dark',
    mesActual: '06',
    anioActual: '2026',
  },
}

export const ACTIONS = {
  // Config
  SET_MES_ACTUAL: 'SET_MES_ACTUAL',
  SET_CONFIG: 'SET_CONFIG',

  // Personal - ingresos
  ADD_INGRESO: 'ADD_INGRESO',
  UPDATE_INGRESO: 'UPDATE_INGRESO',
  DELETE_INGRESO: 'DELETE_INGRESO',

  // Personal - presupuesto
  ADD_ITEM_CATEGORIA: 'ADD_ITEM_CATEGORIA',
  UPDATE_ITEM_CATEGORIA: 'UPDATE_ITEM_CATEGORIA',
  DELETE_ITEM_CATEGORIA: 'DELETE_ITEM_CATEGORIA',
  ADD_CATEGORIA: 'ADD_CATEGORIA',
  UPDATE_CATEGORIA: 'UPDATE_CATEGORIA',
  DELETE_CATEGORIA: 'DELETE_CATEGORIA',

  // Personal - transacciones
  ADD_TRANSACCION: 'ADD_TRANSACCION',
  DELETE_TRANSACCION: 'DELETE_TRANSACCION',

  // Personal - tarjetas
  ADD_TARJETA: 'ADD_TARJETA',
  UPDATE_TARJETA: 'UPDATE_TARJETA',
  DELETE_TARJETA: 'DELETE_TARJETA',

  // Personal - deudas
  ADD_DEUDA: 'ADD_DEUDA',
  UPDATE_DEUDA: 'UPDATE_DEUDA',
  DELETE_DEUDA: 'DELETE_DEUDA',

  // Personal - metas
  ADD_META: 'ADD_META',
  UPDATE_META: 'UPDATE_META',
  DELETE_META: 'DELETE_META',
  ABONAR_META: 'ABONAR_META',

  // Personal - patrimonio
  ADD_ACTIVO: 'ADD_ACTIVO',
  UPDATE_ACTIVO: 'UPDATE_ACTIVO',
  DELETE_ACTIVO: 'DELETE_ACTIVO',

  // Meta ahorro
  SET_META_AHORRO: 'SET_META_AHORRO',

  // Estudio
  ADD_INGRESO_ESTUDIO: 'ADD_INGRESO_ESTUDIO',
  UPDATE_INGRESO_ESTUDIO: 'UPDATE_INGRESO_ESTUDIO',
  DELETE_INGRESO_ESTUDIO: 'DELETE_INGRESO_ESTUDIO',
  ADD_GASTO_ESTUDIO: 'ADD_GASTO_ESTUDIO',
  UPDATE_GASTO_ESTUDIO: 'UPDATE_GASTO_ESTUDIO',
  DELETE_GASTO_ESTUDIO: 'DELETE_GASTO_ESTUDIO',
  SET_DISTRIBUCION_ESTUDIO: 'SET_DISTRIBUCION_ESTUDIO',
  SET_CATEGORIAS_ESTUDIO: 'SET_CATEGORIAS_ESTUDIO',
  IMPORT_ESTUDIO: 'IMPORT_ESTUDIO',

  // Suscripciones
  ADD_SUSCRIPCION: 'ADD_SUSCRIPCION',
  UPDATE_SUSCRIPCION: 'UPDATE_SUSCRIPCION',
  DELETE_SUSCRIPCION: 'DELETE_SUSCRIPCION',
  TOGGLE_SUSCRIPCION: 'TOGGLE_SUSCRIPCION',

  // Import
  IMPORT_DATA: 'IMPORT_DATA',
}

const uid = () => Math.random().toString(36).slice(2, 9)

export function reducer(state, action) {
  switch (action.type) {

    case ACTIONS.SET_MES_ACTUAL:
      return { ...state, config: { ...state.config, mesActual: action.mes, anioActual: action.anio } }

    case ACTIONS.SET_CONFIG:
      return { ...state, config: { ...state.config, ...action.payload } }

    case ACTIONS.ADD_INGRESO:
      return {
        ...state,
        personal: {
          ...state.personal,
          ingresos: [...state.personal.ingresos, { id: uid(), ...action.payload, activo: true }],
        },
      }

    case ACTIONS.UPDATE_INGRESO:
      return {
        ...state,
        personal: {
          ...state.personal,
          ingresos: state.personal.ingresos.map(i => i.id === action.id ? { ...i, ...action.payload } : i),
        },
      }

    case ACTIONS.DELETE_INGRESO:
      return {
        ...state,
        personal: {
          ...state.personal,
          ingresos: state.personal.ingresos.filter(i => i.id !== action.id),
        },
      }

    case ACTIONS.ADD_ITEM_CATEGORIA:
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: {
            ...state.personal.presupuesto,
            categorias: {
              ...state.personal.presupuesto.categorias,
              [action.categoria]: {
                ...state.personal.presupuesto.categorias[action.categoria],
                items: [
                  ...state.personal.presupuesto.categorias[action.categoria].items,
                  { id: uid(), ...action.payload },
                ],
              },
            },
          },
        },
      }

    case ACTIONS.UPDATE_ITEM_CATEGORIA:
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: {
            ...state.personal.presupuesto,
            categorias: {
              ...state.personal.presupuesto.categorias,
              [action.categoria]: {
                ...state.personal.presupuesto.categorias[action.categoria],
                items: state.personal.presupuesto.categorias[action.categoria].items.map(
                  i => i.id === action.id ? { ...i, ...action.payload } : i
                ),
              },
            },
          },
        },
      }

    case ACTIONS.DELETE_ITEM_CATEGORIA:
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: {
            ...state.personal.presupuesto,
            categorias: {
              ...state.personal.presupuesto.categorias,
              [action.categoria]: {
                ...state.personal.presupuesto.categorias[action.categoria],
                items: state.personal.presupuesto.categorias[action.categoria].items.filter(i => i.id !== action.id),
              },
            },
          },
        },
      }

    case ACTIONS.ADD_CATEGORIA:
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: {
            ...state.personal.presupuesto,
            categorias: {
              ...state.personal.presupuesto.categorias,
              [action.key]: { emoji: action.emoji, nombre: action.nombre, items: [] },
            },
          },
        },
      }

    case ACTIONS.UPDATE_CATEGORIA: {
      const catActual = state.personal.presupuesto.categorias[action.key]
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: {
            ...state.personal.presupuesto,
            categorias: {
              ...state.personal.presupuesto.categorias,
              [action.key]: { ...catActual, emoji: action.emoji, nombre: action.nombre },
            },
          },
        },
      }
    }

    case ACTIONS.DELETE_CATEGORIA: {
      const { [action.key]: _removed, ...restCats } = state.personal.presupuesto.categorias
      return {
        ...state,
        personal: {
          ...state.personal,
          presupuesto: { ...state.personal.presupuesto, categorias: restCats },
        },
      }
    }

    case ACTIONS.ADD_TRANSACCION: {
      const { mes, anio } = action
      const prev = state.personal.gastosMensuales?.[anio]?.[mes] || { transacciones: [], totalGastado: 0 }
      const nuevaTransaccion = { id: uid(), fecha: new Date().toISOString(), ...action.payload }
      const nuevasTransacciones = [nuevaTransaccion, ...prev.transacciones]
      return {
        ...state,
        personal: {
          ...state.personal,
          gastosMensuales: {
            ...state.personal.gastosMensuales,
            [anio]: {
              ...state.personal.gastosMensuales?.[anio],
              [mes]: {
                transacciones: nuevasTransacciones,
                totalGastado: nuevasTransacciones.reduce((s, t) => s + t.monto, 0),
              },
            },
          },
        },
      }
    }

    case ACTIONS.DELETE_TRANSACCION: {
      const { mes, anio } = action
      const prev = state.personal.gastosMensuales?.[anio]?.[mes] || { transacciones: [] }
      const filtradas = prev.transacciones.filter(t => t.id !== action.id)
      return {
        ...state,
        personal: {
          ...state.personal,
          gastosMensuales: {
            ...state.personal.gastosMensuales,
            [anio]: {
              ...state.personal.gastosMensuales?.[anio],
              [mes]: {
                transacciones: filtradas,
                totalGastado: filtradas.reduce((s, t) => s + t.monto, 0),
              },
            },
          },
        },
      }
    }

    case ACTIONS.ADD_TARJETA:
      return {
        ...state,
        personal: { ...state.personal, tarjetas: [...state.personal.tarjetas, { id: uid(), ...action.payload }] },
      }

    case ACTIONS.UPDATE_TARJETA:
      return {
        ...state,
        personal: {
          ...state.personal,
          tarjetas: state.personal.tarjetas.map(t => t.id === action.id ? { ...t, ...action.payload } : t),
        },
      }

    case ACTIONS.DELETE_TARJETA:
      return {
        ...state,
        personal: { ...state.personal, tarjetas: state.personal.tarjetas.filter(t => t.id !== action.id) },
      }

    case ACTIONS.ADD_DEUDA:
      return {
        ...state,
        personal: { ...state.personal, deudas: [...state.personal.deudas, { id: uid(), ...action.payload }] },
      }

    case ACTIONS.UPDATE_DEUDA:
      return {
        ...state,
        personal: {
          ...state.personal,
          deudas: state.personal.deudas.map(d => d.id === action.id ? { ...d, ...action.payload } : d),
        },
      }

    case ACTIONS.DELETE_DEUDA:
      return {
        ...state,
        personal: { ...state.personal, deudas: state.personal.deudas.filter(d => d.id !== action.id) },
      }

    case ACTIONS.ADD_META:
      return {
        ...state,
        personal: { ...state.personal, metas: [...state.personal.metas, { id: uid(), ahorroActual: 0, ...action.payload }] },
      }

    case ACTIONS.UPDATE_META:
      return {
        ...state,
        personal: {
          ...state.personal,
          metas: state.personal.metas.map(m => m.id === action.id ? { ...m, ...action.payload } : m),
        },
      }

    case ACTIONS.ABONAR_META:
      return {
        ...state,
        personal: {
          ...state.personal,
          metas: state.personal.metas.map(m =>
            m.id === action.id ? { ...m, ahorroActual: m.ahorroActual + action.monto } : m
          ),
        },
      }

    case ACTIONS.DELETE_META:
      return {
        ...state,
        personal: { ...state.personal, metas: state.personal.metas.filter(m => m.id !== action.id) },
      }

    case ACTIONS.ADD_ACTIVO:
      return {
        ...state,
        personal: {
          ...state.personal,
          patrimonio: { ...state.personal.patrimonio, activos: [...state.personal.patrimonio.activos, { id: uid(), ...action.payload }] },
        },
      }

    case ACTIONS.UPDATE_ACTIVO:
      return {
        ...state,
        personal: {
          ...state.personal,
          patrimonio: {
            ...state.personal.patrimonio,
            activos: state.personal.patrimonio.activos.map(a => a.id === action.id ? { ...a, ...action.payload } : a),
          },
        },
      }

    case ACTIONS.DELETE_ACTIVO:
      return {
        ...state,
        personal: {
          ...state.personal,
          patrimonio: {
            ...state.personal.patrimonio,
            activos: state.personal.patrimonio.activos.filter(a => a.id !== action.id),
          },
        },
      }

    case ACTIONS.SET_META_AHORRO:
      return { ...state, personal: { ...state.personal, metaAhorro: action.valor } }

    case ACTIONS.ADD_INGRESO_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, ingresos: [...state.estudio.ingresos, { id: uid(), ...action.payload }] },
      }

    case ACTIONS.UPDATE_INGRESO_ESTUDIO:
      return {
        ...state,
        estudio: {
          ...state.estudio,
          ingresos: state.estudio.ingresos.map(i => i.id === action.id ? { ...i, ...action.payload } : i),
        },
      }

    case ACTIONS.DELETE_INGRESO_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, ingresos: state.estudio.ingresos.filter(i => i.id !== action.id) },
      }

    case ACTIONS.ADD_GASTO_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, gastos: [...state.estudio.gastos, { id: uid(), ...action.payload }] },
      }

    case ACTIONS.UPDATE_GASTO_ESTUDIO:
      return {
        ...state,
        estudio: {
          ...state.estudio,
          gastos: state.estudio.gastos.map(g => g.id === action.id ? { ...g, ...action.payload } : g),
        },
      }

    case ACTIONS.DELETE_GASTO_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, gastos: state.estudio.gastos.filter(g => g.id !== action.id) },
      }

    case ACTIONS.SET_DISTRIBUCION_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, distribucion: action.distribucion },
      }

    case ACTIONS.SET_CATEGORIAS_ESTUDIO:
      return {
        ...state,
        estudio: { ...state.estudio, categorias: action.categorias },
      }

    case ACTIONS.IMPORT_ESTUDIO:
      return {
        ...state,
        estudio: { ...action.estudio },
      }

    case ACTIONS.ADD_SUSCRIPCION:
      return {
        ...state,
        suscripciones: [...state.suscripciones, { id: uid(), activa: true, ...action.payload }],
      }

    case ACTIONS.UPDATE_SUSCRIPCION:
      return {
        ...state,
        suscripciones: state.suscripciones.map(s => s.id === action.id ? { ...s, ...action.payload } : s),
      }

    case ACTIONS.DELETE_SUSCRIPCION:
      return { ...state, suscripciones: state.suscripciones.filter(s => s.id !== action.id) }

    case ACTIONS.TOGGLE_SUSCRIPCION:
      return {
        ...state,
        suscripciones: state.suscripciones.map(s => s.id === action.id ? { ...s, activa: !s.activa } : s),
      }

    case ACTIONS.IMPORT_DATA:
      return { ...action.data }

    default:
      return state
  }
}

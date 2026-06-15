const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_1 = ['E','F','M','A','M','J','J','A','S','O','N','D']

export const nombreMes = (num) => MESES[parseInt(num, 10) - 1] || ''
export const nombreMesCorto = (num) => MESES_CORTOS[parseInt(num, 10) - 1] || ''
export const letraMes = (num) => MESES_1[parseInt(num, 10) - 1] || ''

export const mesActual = () => String(new Date().getMonth() + 1).padStart(2, '0')
export const anioActual = () => String(new Date().getFullYear())

export const formatFecha = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export const formatFechaHora = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const diasHastaFecha = (dia) => {
  const hoy = new Date().getDate()
  return dia - hoy
}

export const mesAnterior = (mes, anio) => {
  const m = parseInt(mes, 10)
  const a = parseInt(anio, 10)
  if (m === 1) return { mes: '12', anio: String(a - 1) }
  return { mes: String(m - 1).padStart(2, '0'), anio: String(a) }
}

export const mesSiguiente = (mes, anio) => {
  const m = parseInt(mes, 10)
  const a = parseInt(anio, 10)
  if (m === 12) return { mes: '01', anio: String(a + 1) }
  return { mes: String(m + 1).padStart(2, '0'), anio: String(a) }
}

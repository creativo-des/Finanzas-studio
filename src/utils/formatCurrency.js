export const formatCOP = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export const formatCOPShort = (value) => {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`
  return formatCOP(value)
}

export const parseAmount = (raw) => {
  const numeric = String(raw).replace(/\D/g, '')
  return Number(numeric) || 0
}

export const formatAmountDisplay = (raw) => {
  const numeric = String(raw).replace(/\D/g, '')
  if (!numeric) return ''
  return new Intl.NumberFormat('es-CO').format(Number(numeric))
}

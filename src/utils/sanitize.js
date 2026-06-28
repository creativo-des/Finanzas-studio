const HTML_RE = /<[^>]*>/g
const DANGER_RE = /[<>"'`\\]/g

export const sanitizeText = (str, maxLength = 100) => {
  if (typeof str !== 'string') return ''
  return str.replace(HTML_RE, '').replace(DANGER_RE, '').trim().slice(0, maxLength)
}

export const sanitizeAmount = (val, min = 0, max = 999_999_999) => {
  const n = parseFloat(String(val).replace(/[^0-9.-]/g, ''))
  if (!isFinite(n) || isNaN(n)) return 0
  return Math.min(Math.max(n, min), max)
}

export const sanitizeInt = (val, min = 1, max = 9999) => {
  const n = parseInt(String(val), 10)
  if (isNaN(n)) return min
  return Math.min(Math.max(n, min), max)
}

export const sanitizePercent = (val, maxVal = 100) => {
  const n = parseFloat(String(val))
  if (!isFinite(n) || isNaN(n)) return 0
  return Math.min(Math.max(n, 0), maxVal)
}

export const sanitizeDay = (val) => sanitizeInt(val, 1, 31)

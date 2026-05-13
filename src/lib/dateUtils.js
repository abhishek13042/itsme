const IST_OFFSET = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30

export function getTodayIST() {
  const now = new Date()
  const istNow = new Date(now.getTime() + IST_OFFSET)
  return istNow.toISOString().split('T')[0]
}

export function getISTDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const istDate = new Date(date.getTime() + IST_OFFSET)
  return istDate.toISOString().split('T')[0]
}

export function toISTISOString() {
  const now = new Date()
  const istNow = new Date(now.getTime() + IST_OFFSET)
  return istNow.toISOString()
}

export function isToday(dateStr) {
  return dateStr === getTodayIST()
}

export function formatISTDate(dateStr, options = {}) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options
  })
}

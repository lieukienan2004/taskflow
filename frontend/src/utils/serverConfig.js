const STORAGE_KEY = 'taskflow_server_url'
const DEFAULT_WEB = '/api'
const DEFAULT_CAPACITOR = 'http://10.0.2.2:3001'

export function isCapacitor() {
  if (typeof window === 'undefined') return false
  return !!(
    window.Capacitor ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.location.port === '')
  )
}

export function getApiBase() {
  if (!isCapacitor()) return DEFAULT_WEB
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? saved.replace(/\/+$/, '') : DEFAULT_CAPACITOR
}

export function getServerUrl() {
  return localStorage.getItem(STORAGE_KEY) || ''
}

export function setServerUrl(url) {
  if (url) localStorage.setItem(STORAGE_KEY, url)
  else localStorage.removeItem(STORAGE_KEY)
}

export function getHost() {
  const base = getApiBase()
  if (base === DEFAULT_WEB) return ''
  return base.replace(/\/api\/?$/, '')
}

export function needsServerSetup() {
  if (!isCapacitor()) return false
  return !localStorage.getItem(STORAGE_KEY)
}

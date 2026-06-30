// All persistence lives in localStorage. Two top-level keys:
//   cc:settings        -> { target, quickAdds }
//   cc:log:YYYY-MM-DD   -> [ { id, category, name, calories } ]
// Storing one key per day keeps days independent and easy to look back on.

const SETTINGS_KEY = 'cc:settings'
const LOG_PREFIX = 'cc:log:'

export const CATEGORIES = ['Breakfast', 'Lunch', 'Snack', 'Dinner']

export const DEFAULT_SETTINGS = {
  target: 1200,
  quickAdds: [],
}

// --- date helpers -----------------------------------------------------------

// Returns a local-timezone date key like "2026-06-30" (not UTC, so the day
// rolls over at the user's midnight rather than UTC midnight).
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

// --- settings ---------------------------------------------------------------

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// --- per-day logs -----------------------------------------------------------

export function loadDay(key) {
  try {
    const raw = localStorage.getItem(LOG_PREFIX + key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDay(key, entries) {
  if (!entries || entries.length === 0) {
    localStorage.removeItem(LOG_PREFIX + key)
  } else {
    localStorage.setItem(LOG_PREFIX + key, JSON.stringify(entries))
  }
}

// Total calories for one day's entries.
export function dayTotal(entries) {
  return entries.reduce((sum, e) => sum + (Number(e.calories) || 0), 0)
}

// Returns [{ key, label, total }] for the last `days` days, oldest first.
export function loadHistory(days = 14) {
  const out = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    const key = dateKey(d)
    out.push({
      key,
      date: d,
      total: dayTotal(loadDay(key)),
    })
  }
  return out
}

// --- CSV export -------------------------------------------------------------

// Walks every stored day and produces a CSV string of all entries.
export function exportCsv() {
  const rows = [['date', 'category', 'food', 'calories']]
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(LOG_PREFIX)) keys.push(k)
  }
  keys.sort()
  for (const k of keys) {
    const date = k.slice(LOG_PREFIX.length)
    const entries = loadDay(date)
    for (const e of entries) {
      rows.push([date, e.category, e.name, e.calories])
    }
  }
  return rows
    .map((r) => r.map(csvCell).join(','))
    .join('\n')
}

function csvCell(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

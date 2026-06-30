import { useEffect, useMemo, useState } from 'react'
import {
  CATEGORIES,
  addDays,
  dateKey,
  dayTotal,
  exportCsv,
  loadDay,
  loadHistory,
  loadSettings,
  saveDay,
  saveSettings,
} from './storage.js'
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PlusIcon,
  TrashIcon,
} from './icons.jsx'

let idCounter = 0
function makeId() {
  idCounter += 1
  return `${Date.now()}-${idCounter}`
}

function formatDateLabel(date) {
  const today = dateKey()
  const yesterday = dateKey(addDays(new Date(), -1))
  const key = dateKey(date)
  if (key === today) return 'Today'
  if (key === yesterday) return 'Yesterday'
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [entries, setEntries] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const currentKey = dateKey(viewDate)

  // Load the day's entries whenever the viewed date changes.
  useEffect(() => {
    setEntries(loadDay(currentKey))
  }, [currentKey])

  // Persist settings whenever they change.
  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  // Helper that updates both state and storage for the current day.
  function updateEntries(next) {
    setEntries(next)
    saveDay(currentKey, next)
  }

  function addEntry(category, name, calories) {
    const cleanName = name.trim()
    const cal = Math.round(Number(calories))
    if (!cleanName || !Number.isFinite(cal) || cal <= 0) return
    updateEntries([
      ...entries,
      { id: makeId(), category, name: cleanName, calories: cal },
    ])
  }

  function deleteEntry(id) {
    updateEntries(entries.filter((e) => e.id !== id))
  }

  function clearToday() {
    if (entries.length === 0) return
    if (window.confirm(`Clear all entries for ${formatDateLabel(viewDate)}?`)) {
      updateEntries([])
    }
  }

  const total = dayTotal(entries)
  const target = settings.target || 0
  const remaining = target - total
  const over = remaining < 0
  const pct = target > 0 ? Math.min((total / target) * 100, 100) : 0

  const grouped = useMemo(() => {
    const map = {}
    for (const cat of CATEGORIES) map[cat] = []
    for (const e of entries) {
      if (!map[e.category]) map[e.category] = []
      map[e.category].push(e)
    }
    return map
  }, [entries])

  const isToday = currentKey === dateKey()

  return (
    <div className="app">
      <header className="topbar">
        <button
          className="nav-btn"
          aria-label="Previous day"
          onClick={() => setViewDate((d) => addDays(d, -1))}
        >
          ‹
        </button>
        <div className="date-title">
          <h1>{formatDateLabel(viewDate)}</h1>
          <span className="date-sub">
            {viewDate.toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        <button
          className="nav-btn"
          aria-label="Next day"
          disabled={isToday}
          onClick={() => setViewDate((d) => addDays(d, 1))}
        >
          ›
        </button>
      </header>

      <ProgressCard
        total={total}
        target={target}
        remaining={remaining}
        over={over}
        pct={pct}
      />

      <div className="toolbar">
        <button className="ghost-btn" onClick={() => setShowHistory(true)}>
          History
        </button>
        <button className="ghost-btn" onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button
          className="ghost-btn danger"
          onClick={clearToday}
          disabled={entries.length === 0}
        >
          Clear day
        </button>
      </div>

      {settings.quickAdds.length > 0 && (
        <QuickAdds
          quickAdds={settings.quickAdds}
          onAdd={(q) => addEntry(q.category, q.name, q.calories)}
        />
      )}

      <main className="categories">
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            entries={grouped[cat]}
            onAdd={(name, cal) => addEntry(cat, name, cal)}
            onDelete={deleteEntry}
            onSaveQuick={(name, cal) =>
              setSettings((s) => addQuickAdd(s, cat, name, cal))
            }
          />
        ))}
      </main>

      <footer className="footer">
        Logged locally on this device · {total} kcal total
      </footer>

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showHistory && (
        <HistoryPanel
          target={target}
          onClose={() => setShowHistory(false)}
          onPickDay={(d) => {
            setViewDate(d)
            setShowHistory(false)
          }}
        />
      )}
    </div>
  )
}

function addQuickAdd(settings, category, name, calories) {
  const cleanName = name.trim()
  const cal = Math.round(Number(calories))
  if (!cleanName || !Number.isFinite(cal) || cal <= 0) return settings
  // Avoid duplicates (same name + calories).
  const exists = settings.quickAdds.some(
    (q) => q.name.toLowerCase() === cleanName.toLowerCase() && q.calories === cal,
  )
  if (exists) return settings
  return {
    ...settings,
    quickAdds: [
      ...settings.quickAdds,
      { id: makeId(), category, name: cleanName, calories: cal },
    ],
  }
}

function ProgressCard({ total, target, remaining, over, pct }) {
  return (
    <section className={`progress-card ${over ? 'over' : ''}`}>
      <div className="progress-numbers">
        <span className="big">{total}</span>
        <span className="of">/ {target} kcal</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="remaining">
        {over ? (
          <strong>{Math.abs(remaining)} kcal over</strong>
        ) : (
          <span>{remaining} kcal remaining</span>
        )}
      </div>
    </section>
  )
}

function QuickAdds({ quickAdds, onAdd }) {
  return (
    <section className="quick-adds">
      <h2 className="section-label">Quick add</h2>
      <div className="quick-chips">
        {quickAdds.map((q) => (
          <button
            key={q.id}
            className="chip"
            style={{ borderColor: CATEGORY_COLORS[q.category] }}
            onClick={() => onAdd(q)}
            title={`Add to ${q.category}`}
          >
            <span className="chip-name">{q.name}</span>
            <span className="chip-cal">{q.calories}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function CategorySection({ category, entries, onAdd, onDelete, onSaveQuick }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const Icon = CATEGORY_ICONS[category]
  const color = CATEGORY_COLORS[category]
  const subtotal = dayTotal(entries)

  function submit(e) {
    e.preventDefault()
    onAdd(name, calories)
    setName('')
    setCalories('')
  }

  return (
    <section className="category">
      <div className="category-head">
        <span className="cat-icon" style={{ color }}>
          <Icon />
        </span>
        <h2>{category}</h2>
        <span className="cat-subtotal">{subtotal} kcal</span>
      </div>

      {entries.length > 0 && (
        <ul className="entry-list">
          {entries.map((e) => (
            <li key={e.id} className="entry">
              <span className="entry-name">{e.name}</span>
              <span className="entry-cal">{e.calories}</span>
              <button
                className="icon-btn"
                aria-label={`Delete ${e.name}`}
                onClick={() => onDelete(e.id)}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="add-form" onSubmit={submit}>
        <input
          className="input-name"
          type="text"
          placeholder="Food"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input-cal"
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="kcal"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <button
          className="add-btn"
          style={{ background: color }}
          type="submit"
          aria-label={`Add to ${category}`}
        >
          <PlusIcon width={20} height={20} />
        </button>
        <button
          type="button"
          className="star-btn"
          title="Save as quick-add"
          disabled={!name.trim() || !(Number(calories) > 0)}
          onClick={() => onSaveQuick(name, calories)}
        >
          ★
        </button>
      </form>
    </section>
  )
}

function SettingsPanel({ settings, onChange, onClose }) {
  const [target, setTarget] = useState(String(settings.target))

  function commitTarget() {
    const n = Math.round(Number(target))
    if (Number.isFinite(n) && n > 0) {
      onChange({ ...settings, target: n })
    } else {
      setTarget(String(settings.target))
    }
  }

  function removeQuick(id) {
    onChange({
      ...settings,
      quickAdds: settings.quickAdds.filter((q) => q.id !== id),
    })
  }

  function download() {
    const csv = exportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calorie-log-${dateKey()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      <label className="field">
        <span>Daily calorie target</span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onBlur={commitTarget}
        />
      </label>

      <div className="field">
        <span>Quick-add foods</span>
        {settings.quickAdds.length === 0 ? (
          <p className="hint">
            Tap the ★ next to a food entry to save it here for one-tap logging.
          </p>
        ) : (
          <ul className="quick-manage">
            {settings.quickAdds.map((q) => (
              <li key={q.id}>
                <span>
                  {q.name} · {q.calories} kcal{' '}
                  <em className="muted">({q.category})</em>
                </span>
                <button className="icon-btn" onClick={() => removeQuick(q.id)}>
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="field">
        <span>Export</span>
        <button className="wide-btn" onClick={download}>
          Download all data as CSV
        </button>
      </div>
    </Modal>
  )
}

function HistoryPanel({ target, onClose, onPickDay }) {
  const history = useMemo(() => loadHistory(30), [])
  const max = Math.max(target, ...history.map((h) => h.total), 1)

  return (
    <Modal title="History" onClose={onClose}>
      <p className="hint">Last 30 days · tap a day to view it.</p>
      <ul className="history-list">
        {[...history].reverse().map((h) => {
          const hasData = h.total > 0
          const over = h.total > target
          const widthPct = (h.total / max) * 100
          return (
            <li key={h.key}>
              <button
                className="history-row"
                onClick={() => onPickDay(h.date)}
              >
                <span className="hist-date">
                  {h.date.toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="hist-bar-track">
                  <span
                    className={`hist-bar ${
                      !hasData ? 'empty' : over ? 'over' : 'under'
                    }`}
                    style={{ width: `${hasData ? Math.max(widthPct, 4) : 0}%` }}
                  />
                </span>
                <span className="hist-total">
                  {hasData ? `${h.total}` : '—'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="close-btn" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

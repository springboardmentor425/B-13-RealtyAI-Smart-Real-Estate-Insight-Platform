import { useState } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

const TYPE_ICON = { structured: '📋', satellite: '🛰️', location: '🗺️' }

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function PredictionHistory({ history, onClear }) {
  const [open, setOpen] = useState(false)
  if (history.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Recent Predictions</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {history.length}
          </span>
        </div>
        <span className="text-slate-400 text-xs select-none">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-6 pb-5 animate-fade-up">
          <div className="space-y-0 max-h-56 overflow-y-auto divide-y divide-slate-100">
            {history.map(entry => (
              <div key={entry.id} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="text-base shrink-0">{TYPE_ICON[entry.type] ?? '💰'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 font-medium truncate">{entry.label}</p>
                  <p className="text-slate-400">{timeAgo(entry.ts)}</p>
                </div>
                <span className="font-mono font-bold text-blue-700 shrink-0 text-sm">
                  {formatCurrency(entry.price)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={onClear}
            className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Clear history
          </button>
        </div>
      )}
    </div>
  )
}

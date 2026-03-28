import { useState } from 'react'

export default function InputField({ name, label, description, unit, min, max, step, value, onChange }) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label htmlFor={name} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
        {description && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-colors bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-200"
            >
              ?
            </button>
            {showTip && (
              <div className="absolute left-0 top-6 z-20 w-52 text-xs rounded-xl p-3 shadow-xl animate-fade-in bg-white border border-slate-200 text-slate-600">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          id={name}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          placeholder="—"
          onChange={(e) => onChange(name, e.target.value)}
          className="dark-input w-full px-3 py-2 text-sm pr-14"
          style={{ fontFamily: value ? "'JetBrains Mono', monospace" : 'inherit' }}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

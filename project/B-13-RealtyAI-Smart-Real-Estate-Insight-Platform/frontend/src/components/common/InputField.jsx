import { useState } from 'react'

export default function InputField({ name, label, description, unit, min, max, step, value, onChange }) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {description && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center hover:bg-slate-300"
            >
              ?
            </button>
            {showTip && (
              <div className="absolute left-0 top-5 z-10 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 shadow-lg">
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
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-14"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

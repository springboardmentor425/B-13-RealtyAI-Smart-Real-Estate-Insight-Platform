import { useState } from 'react'

export default function FormSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors text-left bg-slate-50 hover:bg-slate-100"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500" style={{ letterSpacing: '0.1em' }}>{title}</span>
        <span className="text-slate-400" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', display: 'inline-block' }}>
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="p-4 grid grid-cols-2 gap-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

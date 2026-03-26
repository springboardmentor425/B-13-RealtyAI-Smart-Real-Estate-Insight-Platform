import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

const STYLES = {
  success: {
    wrap: 'bg-green-50 border-green-200',
    icon: '✓',
    iconCls: 'bg-green-500 text-white',
    text: 'text-green-800',
  },
  error: {
    wrap: 'bg-red-50 border-red-200',
    icon: '✕',
    iconCls: 'bg-red-500 text-white',
    text: 'text-red-800',
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200',
    icon: 'i',
    iconCls: 'bg-blue-500 text-white',
    text: 'text-blue-800',
  },
}

function ToastItem({ id, type, message, onDismiss }) {
  const s = STYLES[type] ?? STYLES.info
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg w-80 animate-slide-in ${s.wrap}`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${s.iconCls}`}>
        {s.icon}
      </span>
      <p className={`text-sm flex-1 leading-snug ${s.text}`}>{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-600 text-sm leading-none shrink-0 mt-0.5"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, type, message }])
    setTimeout(() => dismiss(id), 3500)
  }, [dismiss])

  const toast = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg),
    info:    (msg) => add('info', msg),
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx) ?? { success: () => {}, error: () => {}, info: () => {} }
}

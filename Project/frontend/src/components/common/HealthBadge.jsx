export default function HealthBadge({ label, status }) {
  const config = {
    ready:   { bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-700', dot: 'bg-emerald-500' },
    loading: { bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700', dot: 'bg-amber-500' },
    error:   { bg: 'bg-red-50',  border: 'border-red-200',  color: 'text-red-700', dot: 'bg-red-500' },
  }
  const c = config[status] ?? { bg: 'bg-slate-100', border: 'border-slate-200', color: 'text-slate-500', dot: 'bg-slate-400' }
  const pulse = !status || status === 'loading'

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.border} ${c.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}

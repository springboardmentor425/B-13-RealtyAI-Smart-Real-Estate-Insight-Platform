export default function HealthBadge({ label, status }) {
  const styles = {
    ready:   'bg-green-100 text-green-800',
    loading: 'bg-yellow-100 text-yellow-800 animate-pulse',
    error:   'bg-red-100 text-red-800',
  }
  const dots = {
    ready:   'bg-green-500',
    loading: 'bg-yellow-500',
    error:   'bg-red-500',
  }

  const style = styles[status] ?? 'bg-slate-100 text-slate-400 animate-pulse'
  const dot   = dots[status]   ?? 'bg-slate-400'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

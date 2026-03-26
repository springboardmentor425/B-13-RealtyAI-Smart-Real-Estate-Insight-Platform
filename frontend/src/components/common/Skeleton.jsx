export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-3 ${className}`}>
      <Skeleton className="h-3 w-20" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonResult() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-36" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <Skeleton className="h-3 w-28" />
        {[80, 60, 45, 70, 55].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

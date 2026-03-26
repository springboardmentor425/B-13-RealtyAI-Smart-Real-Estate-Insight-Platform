export default function Card({ children, className = '', title }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-slate-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

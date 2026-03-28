export default function Card({ children, className = '', title, accent = false }) {
  return (
    <div className={`glass p-6 animate-fade-in ${className} ${accent ? 'border-blue-300 shadow-md shadow-blue-500/10' : ''}`}>
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-400" style={{ letterSpacing: '0.12em' }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

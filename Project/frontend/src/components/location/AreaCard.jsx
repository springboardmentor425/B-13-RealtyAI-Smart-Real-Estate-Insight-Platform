import Spinner from '../common/Spinner'

function distLabel(m) {
  return m < 1000 ? `${m}m away` : `${(m / 1000).toFixed(1)}km away`
}

export default function AreaCard({ area, isSelected, onSelect, onPredict, isPredicting }) {
  return (
    <div
      onClick={() => onSelect(area)}
      className={`rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative group border ${
        isSelected
          ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-500/10'
          : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
      }`}
    >
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Satellite thumbnail */}
      <div className="relative h-28 overflow-hidden bg-slate-100 border-b border-slate-200">
        <img
          src={area.tile_url}
          alt={area.name}
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
            e.target.parentElement.innerHTML = '<span class="text-3xl opacity-50">🛰️</span>'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        
        {isSelected && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md bg-blue-600 text-white">
            Selected
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 relative z-10">
        <p className="text-sm font-bold truncate text-slate-700">{area.name}</p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs font-medium text-slate-500">{distLabel(area.distance_m)}</p>
          <p className="text-[10px] font-mono font-medium text-blue-500">
            {area.lat.toFixed(3)}, {area.lon.toFixed(3)}
          </p>
        </div>

        {isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onPredict(area) }}
            disabled={isPredicting}
            className="mt-3 w-full btn-primary font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isPredicting ? (
              <><Spinner size="sm" color="text-white" /><span>Analyzing…</span></>
            ) : (
              <><span>🔍</span> Predict Price</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

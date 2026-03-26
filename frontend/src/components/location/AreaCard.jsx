import Spinner from '../common/Spinner'

function distLabel(m) {
  return m < 1000 ? `${m}m away` : `${(m / 1000).toFixed(1)}km away`
}

export default function AreaCard({ area, isSelected, onSelect, onPredict, isPredicting }) {
  return (
    <div
      onClick={() => onSelect(area)}
      className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Satellite thumbnail */}
      <div className="relative h-28 bg-slate-200 overflow-hidden">
        <img
          src={area.tile_url}
          alt={area.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center')
            e.target.parentElement.innerHTML = '<span class="text-2xl">🛰️</span>'
          }}
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Selected
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800 truncate">{area.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{distLabel(area.distance_m)}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-mono">
          {area.lat.toFixed(4)}, {area.lon.toFixed(4)}
        </p>

        {isSelected && (
          <button
            onClick={(e) => { e.stopPropagation(); onPredict(area) }}
            disabled={isPredicting}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {isPredicting ? (
              <><Spinner size="sm" /><span>Analyzing…</span></>
            ) : (
              '🔍 Predict Price'
            )}
          </button>
        )}
      </div>
    </div>
  )
}

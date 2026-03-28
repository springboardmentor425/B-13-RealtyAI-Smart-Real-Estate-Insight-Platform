import Spinner from '../common/Spinner'
import DetectionCanvas from '../satellite/DetectionCanvas'
import SatelliteResult from '../satellite/SatelliteResult'

const RADIUS_OPTIONS = [
  { value: 500,  label: '500m' },
  { value: 1000, label: '1km'  },
  { value: 2000, label: '2km'  },
  { value: 5000, label: '5km'  },
]

const CATEGORY_ICONS = {
  Hospital: '🏥', Clinic: '🏥', School: '🏫', University: '🎓',
  Supermarket: '🛒', Bank: '🏦', Pharmacy: '💊', Park: '🌳',
  Airport: '✈️', 'Fuel Station': '⛽', Restaurant: '🍽️',
  Cafe: '☕', 'Bus Station': '🚌',
}

function distLabel(m) {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`
}

export default function AmenitiesPanel({
  selectedArea, amenities, amenityRadius, onRadiusChange, isLoadingAmenities,
  prediction, previewUrl, isPredicting,
}) {
  const grouped = amenities
    ? amenities.reduce((acc, a) => {
        ;(acc[a.category] = acc[a.category] ?? []).push(a)
        return acc
      }, {})
    : {}

  return (
    <div className="space-y-6">

      {/* Area header + radius selector */}
      <div className="glass p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">{selectedArea.name}</h3>
            <p className="text-xs font-mono mt-1 text-slate-400">
              {selectedArea.lat.toFixed(5)}, {selectedArea.lon.toFixed(5)}
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm bg-blue-50 text-blue-600 border border-blue-100">
            {distLabel(selectedArea.distance_m)} away
          </span>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-3 text-slate-400">Show amenities within</p>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onRadiusChange(value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  amenityRadius === value
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction result */}
      {isPredicting && (
        <div className="glass p-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full animate-spin-slow border-2 border-slate-100 border-t-blue-500" />
            <div className="absolute inset-1 rounded-full bg-slate-50" />
          </div>
          <p className="text-sm font-medium text-blue-500">Analyzing satellite tile…</p>
        </div>
      )}

      {prediction && !isPredicting && (
        <>
          {previewUrl && (
            <div className="glass p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-400" style={{ letterSpacing: '0.12em' }}>
                Detection Preview
              </p>
              <DetectionCanvas imageUrl={previewUrl} detections={prediction.detections} />
            </div>
          )}
          <SatelliteResult prediction={prediction} />
        </>
      )}

      {/* Amenities list */}
      <div className="glass p-5">
        <h4 className="text-sm font-bold text-slate-800">Nearby Amenities</h4>
        {amenities !== null && (
          <p className="text-xs mb-5 font-medium text-slate-500">
            {amenities.length} found within {distLabel(amenityRadius)}
          </p>
        )}

        {isLoadingAmenities ? (
          <div className="flex items-center gap-3 py-6">
            <Spinner size="sm" color="text-blue-500" />
            <span className="text-sm font-medium text-slate-500">Loading amenities…</span>
          </div>
        ) : !amenities || amenities.length === 0 ? (
          <p className="text-sm text-center py-6 font-medium text-slate-500">
            No amenities found within {distLabel(amenityRadius)}.<br />
            Try a larger radius.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg opacity-90">{CATEGORY_ICONS[category] ?? '📍'}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">({items.length})</span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {items.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors hover:bg-slate-50">
                      <span className="truncate flex-1 mr-3 font-medium text-slate-600">{item.name}</span>
                      <span className="shrink-0 font-mono font-medium text-blue-500">
                        {distLabel(item.distance_m)}
                      </span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <p className="text-[10px] uppercase font-bold tracking-wider mt-2 pl-1.5 text-slate-400">
                      + {items.length - 5} MORE
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

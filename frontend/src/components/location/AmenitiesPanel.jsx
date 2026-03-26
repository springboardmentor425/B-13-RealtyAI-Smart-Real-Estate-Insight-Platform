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
    <div className="space-y-4">

      {/* Area header + radius selector */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">{selectedArea.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              {selectedArea.lat.toFixed(5)}, {selectedArea.lon.toFixed(5)}
            </p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium shrink-0">
            {distLabel(selectedArea.distance_m)} from center
          </span>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-2 font-medium">Show amenities within</p>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onRadiusChange(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  amenityRadius === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700'
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
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Analyzing satellite imagery…</p>
        </div>
      )}

      {prediction && !isPredicting && (
        <>
          {previewUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Detection Preview
              </p>
              <DetectionCanvas imageUrl={previewUrl} detections={prediction.detections} />
            </div>
          )}
          <SatelliteResult prediction={prediction} />
        </>
      )}

      {/* Amenities list */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-700 mb-1">Nearby Amenities</h4>
        {amenities !== null && (
          <p className="text-xs text-slate-400 mb-4">
            {amenities.length} found within {distLabel(amenityRadius)}
          </p>
        )}

        {isLoadingAmenities ? (
          <div className="flex items-center gap-2 py-6">
            <Spinner size="sm" />
            <span className="text-sm text-slate-500">Loading amenities…</span>
          </div>
        ) : !amenities || amenities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No amenities found within {distLabel(amenityRadius)}.<br />
            Try a larger radius.
          </p>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{CATEGORY_ICONS[category] ?? '📍'}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {category}
                  </span>
                  <span className="text-xs text-slate-400">({items.length})</span>
                </div>
                <div className="space-y-1.5 pl-7">
                  {items.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 truncate flex-1 mr-2">{item.name}</span>
                      <span className="text-slate-400 shrink-0 font-mono">
                        {distLabel(item.distance_m)}
                      </span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <p className="text-xs text-slate-400">+{items.length - 5} more</p>
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

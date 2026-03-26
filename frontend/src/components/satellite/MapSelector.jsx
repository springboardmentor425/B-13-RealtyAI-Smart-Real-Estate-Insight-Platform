import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Numbered div icon — no external image dependency
function markerIcon(index) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:30px;height:30px;border-radius:50%;
      background:#2563eb;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:700;
      border:2.5px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      cursor:pointer;
    ">${index + 1}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function ClickHandler({ onAdd, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) onAdd({ lat: e.latlng.lat, lon: e.latlng.lng })
    },
  })
  return null
}

export default function MapSelector({ markers, onAdd, onClear, onPredict, isLoading }) {
  const MAX = 4
  const isFull = markers.length >= MAX
  const canPredict = markers.length >= 1

  // Polygon positions (need ≥ 3 points)
  const polygon = markers.length >= 3
    ? markers.map(m => [m.lat, m.lon])
    : null

  // Default center: world view if no markers yet
  const defaultCenter = markers.length > 0
    ? [markers[0].lat, markers[0].lon]
    : [20, 0]

  return (
    <div className="space-y-3">
      {/* Instruction bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {isFull
            ? 'Plot selected — click Predict or clear to redo'
            : `Click on the map to place point ${markers.length + 1} of ${MAX}`}
        </span>
        {markers.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 320 }}>
        <MapContainer
          center={defaultCenter}
          zoom={markers.length > 0 ? 15 : 2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onAdd={onAdd} disabled={isFull || isLoading} />

          {markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lon]} icon={markerIcon(i)} />
          ))}

          {polygon && (
            <Polygon
              positions={polygon}
              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 2 }}
            />
          )}
        </MapContainer>
      </div>

      {/* Marker summary */}
      {markers.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {markers.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-slate-50 rounded-lg px-3 py-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <span className="font-mono text-slate-600">
                {m.lat.toFixed(5)}, {m.lon.toFixed(5)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Predict button */}
      {canPredict && (
        <button
          onClick={onPredict}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
        >
          {isLoading ? 'Fetching tile…' : `🛰️ Fetch & Predict (${markers.length} point${markers.length > 1 ? 's' : ''})`}
        </button>
      )}
    </div>
  )
}

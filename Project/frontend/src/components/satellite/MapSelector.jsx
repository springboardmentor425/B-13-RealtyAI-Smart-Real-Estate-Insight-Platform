import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

function markerIcon(index) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#2563eb;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid #ffffff;
      box-shadow:0 2px 4px rgba(0,0,0,0.2);
      cursor:pointer;
    ">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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

  const polygon = markers.length >= 3
    ? markers.map(m => [m.lat, m.lon])
    : null

  const defaultCenter = markers.length > 0
    ? [markers[0].lat, markers[0].lon]
    : [20, 0]

  return (
    <div className="space-y-4">
      {/* Instruction bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
          {isFull
            ? 'Plot selected — click Predict or clear to redo'
            : `Place point ${markers.length + 1} of ${MAX} on the map`}
        </span>
        {markers.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-semibold hover:underline text-red-500 hover:text-red-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-sm relative z-0 border border-slate-200" style={{ height: 320 }}>
        <MapContainer
          key="map-container-root"
          center={defaultCenter}
          zoom={markers.length > 0 ? 15 : 2}
          style={{ height: '100%', width: '100%', background: '#f8fafc' }}
          scrollWheelZoom={true}
        >
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ClickHandler onAdd={onAdd} disabled={isFull || isLoading} />

            {markers.map((m, i) => (
              <Marker key={`marker-${i}`} position={[m.lat, m.lon]} icon={markerIcon(i)} />
            ))}

            {polygon && (
              <Polygon
                positions={polygon}
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.25, weight: 2, dashArray: '4' }}
              />
            )}
          </>
        </MapContainer>
      </div>

      {/* Marker summary */}
      {markers.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {markers.map((m, i) => (
            <div key={i} className="flex items-center gap-3 text-xs rounded-lg px-3 py-2 bg-slate-50 border border-slate-200">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-100 text-blue-600">
                {i + 1}
              </span>
              <span className="font-mono font-medium text-slate-600">
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
          className="w-full btn-primary text-sm font-semibold py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? 'Fetching tile…' : `🛰️ Fetch & Predict (${markers.length} point${markers.length > 1 ? 's' : ''})`}
        </button>
      )}
    </div>
  )
}

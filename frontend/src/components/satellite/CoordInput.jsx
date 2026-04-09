import Button from '../common/Button'

const PRESETS = [
  { label: '🇮🇳 Nellore, IN',    lat: 14.028033,  lon: 80.020600  },
  { label: '🏖️ Beverly Hills',   lat: 34.0736,    lon: -118.4004  },
  { label: '🌊 Miami Beach',      lat: 25.8103,    lon: -80.1228   },
  { label: '🏡 Greenwich, CT',    lat: 41.0262,    lon: -73.6282   },
  { label: '🏄 Malibu, CA',       lat: 34.0259,    lon: -118.7798  },
  { label: '🏝️ Coral Gables',     lat: 25.7214,    lon: -80.2684   },
]

export default function CoordInput({ coords, onChange, onPredict, isLoading }) {
  const applyPreset = (preset) => {
    onChange('lat',  String(preset.lat))
    onChange('lon',  String(preset.lon))
    onChange('zoom', '18')
  }

  const zoomLabels = { 14: 'City', 16: 'District', 17: 'Street', 18: 'Building', 19: 'Roof', 20: 'Detailed' }

  return (
    <div className="space-y-5">

      {/* Quick picks */}
      <div>
        <p className="text-xs text-slate-500 mb-2 font-medium">Quick picks</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lat / Lon inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Latitude</label>
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="e.g. 14.028033"
            value={coords.lat}
            onChange={(e) => onChange('lat', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Longitude</label>
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="e.g. 80.020600"
            value={coords.lon}
            onChange={(e) => onChange('lon', e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Zoom slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-700">Zoom Level</label>
          <span className="text-sm font-mono font-semibold text-blue-600">
            {coords.zoom} — {zoomLabels[coords.zoom] ?? 'Property'}
          </span>
        </div>
        <input
          type="range"
          min="14"
          max="20"
          step="1"
          value={coords.zoom}
          onChange={(e) => onChange('zoom', parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>14 · City</span>
          <span>18 · Building</span>
          <span>20 · Roof</span>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={onPredict}
        isLoading={isLoading}
        className="w-full"
        disabled={!coords.lat || !coords.lon}
      >
        {isLoading ? 'Fetching tile…' : '🛰️ Fetch & Predict'}
      </Button>
    </div>
  )
}

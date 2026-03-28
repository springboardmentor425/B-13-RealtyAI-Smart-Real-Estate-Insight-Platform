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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400">Latitude</label>
              <input
                type="number"
                value={coords.lat}
                onChange={(e) => onChange('lat', e.target.value)}
                className="dark-input w-full px-4 py-2 text-sm font-mono"
                placeholder="e.g. 42.0298"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-400">Longitude</label>
              <input
                type="number"
                value={coords.lon}
                onChange={(e) => onChange('lon', e.target.value)}
                className="dark-input w-full px-4 py-2 text-sm font-mono"
                placeholder="e.g. -93.6450"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Quick Locations</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
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

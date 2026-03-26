import HealthBadge from '../common/HealthBadge'

export default function Header({ structuredHealth, satelliteHealth }) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏠</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">House Price AI</h1>
            <p className="text-blue-300 text-xs">Ames Housing · Satellite Imagery</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HealthBadge label="XGBoost"   status={structuredHealth?.status ?? null} />
          <HealthBadge label="Satellite" status={satelliteHealth?.status  ?? null} />
        </div>
      </div>
    </header>
  )
}

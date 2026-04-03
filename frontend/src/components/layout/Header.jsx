import HealthBadge from '../common/HealthBadge'

export default function Header({ structuredHealth, satelliteHealth }) {
  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">

        {/* Logo + title */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">🏠</span>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">House Price AI</h1>
            <p className="text-blue-300 text-xs hidden sm:block">Ames Housing · Satellite Imagery · Location Explorer</p>
          </div>
        </div>

        {/* Health badges — label hidden on xs */}
        <div className="flex items-center gap-2 shrink-0">
          <HealthBadge label="XGBoost"   status={structuredHealth?.status ?? null} />
          <HealthBadge label="Satellite" status={satelliteHealth?.status  ?? null} />
        </div>
      </div>
    </header>
  )
}

import { TABS } from '../../utils/constants'

const TAB_CONFIG = [
  { id: TABS.STRUCTURED, label: '📋 Structured Data',   desc: 'Ames Housing features → XGBoost' },
  { id: TABS.SATELLITE,  label: '🛰️ Satellite Image',    desc: 'Aerial photo → YOLOv8 + Gradient Boosting' },
  { id: TABS.LOCATION,   label: '🗺️ Location Explorer',  desc: 'Search areas, amenities & predict prices' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-0">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="block">{tab.label}</span>
                <span className="block text-xs font-normal mt-0.5 opacity-70">{tab.desc}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

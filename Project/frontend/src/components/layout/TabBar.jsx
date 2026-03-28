import { TABS } from '../../utils/constants'

const TAB_CONFIG = [
  { id: TABS.STRUCTURED, icon: '📋', label: 'Structured Data',   desc: 'Ames Housing → XGBoost' },
  { id: TABS.SATELLITE,  icon: '🛰️', label: 'Satellite Image',   desc: 'Aerial → YOLOv8 + GB' },
  { id: TABS.LOCATION,   icon: '🗺️', label: 'Location Explorer', desc: 'Areas & Price Prediction' },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-4">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-5 py-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
                  isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="relative flex flex-col items-start text-left">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  <span className={`text-[11px] mt-1 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                    {tab.desc}
                  </span>
                </span>

                {/* Active gradient underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 tab-indicator" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { SATELLITE_FEATURE_COLORS, SATELLITE_FEATURE_ICONS } from '../../utils/constants'

export default function ConfidenceBar({ feature, score }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 100), 50)
    return () => clearTimeout(t)
  }, [score])

  const color = score >= 0.6 ? 'bg-green-500' : score >= 0.3 ? 'bg-blue-500' : 'bg-slate-300'
  const textColor = score >= 0.6 ? 'text-green-700' : score >= 0.3 ? 'text-blue-700' : 'text-slate-400'
  const icon = SATELLITE_FEATURE_ICONS[feature] ?? '•'

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span>{icon}</span>
          <span>{feature}</span>
        </span>
        <span className={`font-mono font-semibold ${textColor}`}>
          {score > 0 ? `${(score * 100).toFixed(0)}%` : 'Not detected'}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

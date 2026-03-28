import AreaCard from './AreaCard'
import Spinner from '../common/Spinner'

export default function ResidentialGrid({
  areas, selectedArea, onSelect, onPredict, isPredicting, isLoading,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="relative">
          <div className="w-12 h-12 rounded-full animate-spin-slow border-2 border-slate-100 border-t-blue-500" />
          <div className="absolute inset-1 rounded-full bg-slate-50" />
        </div>
        <p className="text-sm font-medium text-blue-500">Finding residential areas…</p>
      </div>
    )
  }

  if (!areas.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-slate-400">
        <span className="text-5xl opacity-70 animate-float">🏘️</span>
        <p className="text-sm text-center font-medium text-slate-500">
          No residential areas found nearby.<br />
          Try a different location or increase the radius.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {areas.map((area, i) => (
        <AreaCard
          key={i}
          area={area}
          isSelected={selectedArea?.name === area.name}
          onSelect={onSelect}
          onPredict={onPredict}
          isPredicting={isPredicting}
        />
      ))}
    </div>
  )
}

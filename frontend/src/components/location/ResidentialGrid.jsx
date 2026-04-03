import AreaCard from './AreaCard'
import Spinner from '../common/Spinner'

export default function ResidentialGrid({
  areas, selectedArea, onSelect, onPredict, isPredicting, isLoading,
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Finding residential areas…</p>
      </div>
    )
  }

  if (!areas.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
        <span className="text-4xl">🏘️</span>
        <p className="text-sm text-center">
          No residential areas found nearby.<br />
          Try a different location or increase the radius.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
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

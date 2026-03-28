import { useRef, useEffect } from 'react'
import Spinner from '../common/Spinner'

export default function LocationSearch({
  query, suggestions, showSuggestions, isSearching,
  onQueryChange, onSelectSuggestion, onNearMe, setShowSuggestions,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setShowSuggestions])

  return (
    <div className="flex gap-3" ref={containerRef}>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search a location (e.g. Beverly Hills, CA)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="dark-input w-full px-4 py-3 text-sm focus:outline-none focus:ring-2 pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" color="text-blue-500" />
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in bg-white border border-slate-200">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSelectSuggestion(s)}
                className="w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <div className="font-semibold text-slate-700">{s.name}</div>
                <div className="text-xs truncate mt-0.5 text-slate-500">{s.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onNearMe}
        title="Use my current location"
        className="px-5 py-3 rounded-xl btn-primary text-sm font-semibold whitespace-nowrap shadow-lg flex items-center gap-2"
      >
        <span>📍</span> Near me
      </button>
    </div>
  )
}

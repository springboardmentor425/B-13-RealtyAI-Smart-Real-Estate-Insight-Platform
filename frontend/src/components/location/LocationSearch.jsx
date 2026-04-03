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
    <div className="flex gap-2" ref={containerRef}>
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search a location (e.g. Beverly Hills, CA)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSelectSuggestion(s)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 border-b border-slate-100 last:border-0 transition-colors"
              >
                <div className="font-medium text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-500 truncate">{s.display_name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onNearMe}
        title="Use my current location"
        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
      >
        📍 Near me
      </button>
    </div>
  )
}

import { useLocation } from '../../hooks/useLocation'
import LocationSearch from './LocationSearch'
import ResidentialGrid from './ResidentialGrid'
import AmenitiesPanel from './AmenitiesPanel'
import ErrorBanner from '../common/ErrorBanner'

export default function LocationTab() {
  const {
    query, suggestions, showSuggestions, selectedLocation,
    areas, selectedArea, amenities, amenityRadius,
    prediction, previewUrl,
    isSearching, isLoadingAreas, isLoadingAmenities, isPredicting, error,
    handleQueryChange, handleSelectSuggestion, handleNearMe,
    handleSelectArea, handleRadiusChange, handlePredict,
    setShowSuggestions, setError,
  } = useLocation()

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left panel ── */}
        <div className="space-y-4">

          {/* Search bar */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Location Explorer
            </h2>
            <LocationSearch
              query={query}
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              isSearching={isSearching}
              onQueryChange={handleQueryChange}
              onSelectSuggestion={handleSelectSuggestion}
              onNearMe={handleNearMe}
              setShowSuggestions={setShowSuggestions}
            />
            <p className="text-xs text-slate-400 mt-3">
              Type a city, neighbourhood, or address — or tap "Near me" to use your current location.
            </p>
          </div>

          {/* Residential grid */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            {!selectedLocation && !isLoadingAreas ? (
              <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                <span className="text-5xl">🗺️</span>
                <p className="text-sm text-center">
                  Search a location or use "Near me" to explore residential areas and predict property prices.
                </p>
              </div>
            ) : (
              <>
                {selectedLocation && !isLoadingAreas && (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Near <span className="text-blue-600">{selectedLocation.name}</span>
                    </h3>
                    <span className="text-xs text-slate-400">{areas.length} area{areas.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <ResidentialGrid
                  areas={areas}
                  selectedArea={selectedArea}
                  onSelect={handleSelectArea}
                  onPredict={handlePredict}
                  isPredicting={isPredicting}
                  isLoading={isLoadingAreas}
                />
              </>
            )}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div>
          {!selectedArea ? (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-10 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-3">🏘️</span>
              <p className="text-sm text-center">
                Select a residential area on the left to view nearby amenities and predict property prices.
              </p>
            </div>
          ) : (
            <AmenitiesPanel
              selectedArea={selectedArea}
              amenities={amenities}
              amenityRadius={amenityRadius}
              onRadiusChange={handleRadiusChange}
              isLoadingAmenities={isLoadingAmenities}
              prediction={prediction}
              previewUrl={previewUrl}
              isPredicting={isPredicting}
            />
          )}
        </div>
      </div>
    </div>
  )
}

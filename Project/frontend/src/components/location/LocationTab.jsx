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
    <div className="space-y-6 animate-fade-up">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left panel ── */}
        <div className="space-y-6">

          {/* Search bar */}
          <div className="glass p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-400" style={{ letterSpacing: '0.12em' }}>
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
            <p className="text-xs mt-3 font-medium text-slate-400">
              Type a city, neighbourhood, or address — or tap "Near me" to use your current location.
            </p>
          </div>

          {/* Residential grid */}
          <div className="glass p-6">
            {!selectedLocation && !isLoadingAreas ? (
              <div className="flex flex-col items-center gap-4 py-12 text-slate-400">
                <span className="text-5xl opacity-70 animate-float">🗺️</span>
                <p className="text-sm text-center font-medium text-slate-500">
                  Search a location or use "Near me" to explore residential areas and predict property prices.
                </p>
              </div>
            ) : (
              <>
                {selectedLocation && !isLoadingAreas && (
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Near <span className="text-blue-600">{selectedLocation.name}</span>
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">
                      {areas.length} area{areas.length !== 1 ? 's' : ''}
                    </span>
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
            <div className="glass p-10 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-4 opacity-70 animate-float">🏘️</span>
              <p className="text-sm text-center font-medium text-slate-500">
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

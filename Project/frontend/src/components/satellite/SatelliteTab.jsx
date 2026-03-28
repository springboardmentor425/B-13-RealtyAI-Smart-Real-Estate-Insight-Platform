import { useSatellite } from '../../hooks/useSatellite'
import ImageUploader from './ImageUploader'
import ImagePreview from './ImagePreview'
import DetectionCanvas from './DetectionCanvas'
import CoordInput from './CoordInput'
import MapSelector from './MapSelector'
import SatelliteResult from './SatelliteResult'
import Button from '../common/Button'
import ErrorBanner from '../common/ErrorBanner'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

const MODES = [
  { id: 'upload', label: '📤 Upload' },
  { id: 'coords', label: '📍 Coords' },
  { id: 'map',    label: '🗺️ Map' },
]

function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex rounded-xl p-1 gap-1 bg-slate-100 border border-slate-200">
      {MODES.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            mode === tab.id
              ? 'bg-white shadow-sm text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default function SatelliteTab() {
  const {
    mode, coords, file, previewUrl, prediction, modelInfo, isLoading, error,
    mapMarkers,
    handleModeChange, handleCoordsChange, handlePredictByCoords,
    handleFileSelect, handleRemove, handlePredict,
    handleMapMarkerAdd, handleMapClear, handlePredictByMap,
  } = useSatellite()

  const hasResult  = !!prediction
  const loadingMsg = mode === 'coords' || mode === 'map'
    ? 'Fetching tile & running detection…'
    : 'Running YOLOv8 detection…'
  const emptyMsg   = mode === 'upload'
    ? 'Upload an aerial image to see feature detection results'
    : mode === 'coords'
    ? 'Enter coordinates to fetch and analyse a satellite tile'
    : 'Click on the map to mark a plot, then predict its price'

  const handleReset = () => {
    if (mode === 'upload') handleRemove()
    else if (mode === 'map') handleMapClear()
    else handleModeChange('coords')
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {error && <ErrorBanner message={error} onDismiss={handleReset} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left panel ── */}
        <div className="space-y-6">
          <div className="glass p-6">

            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              {!hasResult ? (
                <ModeToggle mode={mode} onChange={handleModeChange} />
              ) : (
                <>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400" style={{ letterSpacing: '0.12em' }}>
                    Detection Preview
                    {prediction?.tile_info && (
                      <span className="ml-2 font-medium text-blue-500">
                        ({prediction.tile_info.lat.toFixed(4)}, {prediction.tile_info.lon.toFixed(4)})
                      </span>
                    )}
                  </h2>
                  <button onClick={handleReset} className="text-xs font-semibold hover:underline text-blue-500">
                    Try another
                  </button>
                </>
              )}
            </div>

            {/* ── Upload mode ── */}
            {mode === 'upload' && !hasResult && (
              !file ? (
                <ImageUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              ) : (
                <div className="space-y-4">
                  <ImagePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} />
                  <Button variant="primary" onClick={handlePredict} isLoading={isLoading} className="w-full">
                    {isLoading ? 'Analyzing…' : '🔍 Detect & Predict Price'}
                  </Button>
                </div>
              )
            )}

            {/* ── Coords mode ── */}
            {mode === 'coords' && !hasResult && (
              <CoordInput
                coords={coords}
                onChange={handleCoordsChange}
                onPredict={handlePredictByCoords}
                isLoading={isLoading}
              />
            )}

            {/* ── Map mode ── */}
            {mode === 'map' && !hasResult && (
              <MapSelector
                markers={mapMarkers}
                onAdd={handleMapMarkerAdd}
                onClear={handleMapClear}
                onPredict={handlePredictByMap}
                isLoading={isLoading}
              />
            )}

            {/* ── After prediction — detection canvas ── */}
            {hasResult && previewUrl && (
              <DetectionCanvas imageUrl={previewUrl} detections={prediction.detections} />
            )}
          </div>

          {/* Detection legend */}
          {hasResult && prediction.detections?.length > 0 && (
            <Card title={`${prediction.detections.length} Detection${prediction.detections.length !== 1 ? 's' : ''} Found`}>
              <div className="space-y-2">
                {prediction.detections.map((det, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-700">{det.feature}</span>
                    <span className="font-mono font-bold text-blue-600">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pipeline info (only when idle) */}
          {modelInfo && !hasResult && !isLoading && (
            <Card title="Detection Pipeline">
              <ol className="space-y-2">
                {modelInfo.model_pipeline.map((step) => (
                  <li key={step} className="text-xs flex gap-3 text-slate-500 font-medium">
                    <span className="font-bold text-blue-500">→</span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        {/* ── Right panel ── */}
        <div>
          {isLoading && (
            <div className="glass p-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full animate-spin-slow border-2 border-slate-100 border-t-blue-500" />
                <div className="absolute inset-1 rounded-full bg-slate-50" />
              </div>
              <p className="text-sm font-medium text-blue-500">{loadingMsg}</p>
            </div>
          )}

          {!isLoading && !hasResult && (
            <div className="glass p-10 flex flex-col items-center">
              <span className="text-4xl mb-4 opacity-70 animate-float">🛰️</span>
              <p className="text-sm text-center font-medium text-slate-500">{emptyMsg}</p>
            </div>
          )}

          {hasResult && <SatelliteResult prediction={prediction} />}
        </div>
      </div>
    </div>
  )
}

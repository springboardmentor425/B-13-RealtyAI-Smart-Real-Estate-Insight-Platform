import { lazy, Suspense, useEffect } from 'react'
import { useSatellite } from '../../hooks/useSatellite'
import { usePredictionHistory } from '../../hooks/usePredictionHistory'
import ImageUploader from './ImageUploader'
import ImagePreview from './ImagePreview'
import DetectionCanvas from './DetectionCanvas'
import CoordInput from './CoordInput'
import SatelliteResult from './SatelliteResult'
import PredictionHistory from '../common/PredictionHistory'
import Button from '../common/Button'
import ErrorBanner from '../common/ErrorBanner'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

// Leaflet is heavy — only load when Map tab is first opened
const MapSelector = lazy(() => import('./MapSelector'))

const MODES = [
  { id: 'upload', label: '📤 Upload' },
  { id: 'coords', label: '📍 Coords' },
  { id: 'map',    label: '🗺️ Map'    },
]

function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 gap-1">
      {MODES.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === tab.id
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
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
    mode, coords, file, compressed, previewUrl, prediction, modelInfo, isLoading, error,
    mapMarkers,
    handleModeChange, handleCoordsChange, handlePredictByCoords,
    handleFileSelect, handleRemove, handlePredict,
    handleMapMarkerAdd, handleMapClear, handlePredictByMap,
  } = useSatellite()

  const { history, addEntry, clearHistory } = usePredictionHistory()

  // Save every new satellite prediction to history
  useEffect(() => {
    if (!prediction) return
    const label = prediction.tile_info
      ? `${prediction.tile_info.lat.toFixed(4)}, ${prediction.tile_info.lon.toFixed(4)}`
      : file?.name ?? 'Uploaded image'
    addEntry({ type: 'satellite', label, price: prediction.predicted_price })
  }, [prediction]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasResult  = !!prediction
  const loadingMsg = mode === 'upload' ? 'Running YOLOv8 detection…' : 'Fetching tile & running detection…'
  const emptyMsg   = mode === 'upload'
    ? 'Upload an aerial image to see feature detection results'
    : mode === 'coords'
    ? 'Enter coordinates to fetch and analyse a satellite tile'
    : 'Click on the map to mark a plot (up to 4 points), then predict its price'

  const handleReset = () => {
    if (mode === 'upload') handleRemove()
    else if (mode === 'map') handleMapClear()
    else handleModeChange('coords')
  }

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={handleReset} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left panel ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">

            {/* Header row */}
            <div className="flex items-center justify-between mb-5">
              {!hasResult ? (
                <ModeToggle mode={mode} onChange={handleModeChange} />
              ) : (
                <>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Detection Preview
                    {prediction?.tile_info && (
                      <span className="ml-2 text-blue-500 normal-case font-normal">
                        ({prediction.tile_info.lat.toFixed(4)}, {prediction.tile_info.lon.toFixed(4)})
                      </span>
                    )}
                  </h2>
                  <button onClick={handleReset} className="text-xs text-blue-600 hover:underline">
                    Try another
                  </button>
                </>
              )}
            </div>

            {/* Upload mode */}
            {mode === 'upload' && !hasResult && (
              !file ? (
                <ImageUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
              ) : (
                <div className="space-y-4">
                  <ImagePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} />
                  {compressed && (
                    <p className="text-xs text-center text-slate-400">
                      Image compressed to reduce upload size
                    </p>
                  )}
                  <Button variant="primary" onClick={handlePredict} isLoading={isLoading} className="w-full">
                    {isLoading ? 'Analyzing…' : '🔍 Detect & Predict Price'}
                  </Button>
                </div>
              )
            )}

            {/* Coords mode */}
            {mode === 'coords' && !hasResult && (
              <CoordInput
                coords={coords}
                onChange={handleCoordsChange}
                onPredict={handlePredictByCoords}
                isLoading={isLoading}
              />
            )}

            {/* Map mode — lazy loaded */}
            {mode === 'map' && !hasResult && (
              <Suspense fallback={
                <div className="flex flex-col items-center gap-3 py-12">
                  <Spinner size="lg" />
                  <p className="text-sm text-slate-500">Loading map…</p>
                </div>
              }>
                <MapSelector
                  markers={mapMarkers}
                  onAdd={handleMapMarkerAdd}
                  onClear={handleMapClear}
                  onPredict={handlePredictByMap}
                  isLoading={isLoading}
                />
              </Suspense>
            )}

            {/* After prediction — detection canvas */}
            {hasResult && previewUrl && (
              <DetectionCanvas imageUrl={previewUrl} detections={prediction.detections} />
            )}
          </div>

          {/* Detection legend */}
          {hasResult && prediction.detections?.length > 0 && (
            <Card title={`${prediction.detections.length} Detection${prediction.detections.length !== 1 ? 's' : ''} Found`}>
              <div className="space-y-1.5">
                {prediction.detections.map((det, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{det.feature}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {(det.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Pipeline info */}
          {modelInfo && !hasResult && !isLoading && (
            <Card title="Detection Pipeline">
              <ol className="space-y-1.5">
                {modelInfo.model_pipeline.map((step) => (
                  <li key={step} className="text-xs text-slate-600 flex gap-2">
                    <span className="text-blue-400 shrink-0">→</span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {/* Prediction history */}
          <PredictionHistory history={history} onClear={clearHistory} />
        </div>

        {/* ── Right panel ── */}
        <div>
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-10 flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-slate-500">{loadingMsg}</p>
            </div>
          )}

          {!isLoading && !hasResult && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-10 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-3">🛰️</span>
              <p className="text-sm text-center">{emptyMsg}</p>
            </div>
          )}

          {hasResult && <SatelliteResult prediction={prediction} />}
        </div>
      </div>
    </div>
  )
}

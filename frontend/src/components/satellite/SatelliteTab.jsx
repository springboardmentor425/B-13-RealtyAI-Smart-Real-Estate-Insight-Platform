import { useSatellite } from '../../hooks/useSatellite'
import ImageUploader from './ImageUploader'
import ImagePreview from './ImagePreview'
import DetectionCanvas from './DetectionCanvas'
import SatelliteResult from './SatelliteResult'
import Button from '../common/Button'
import ErrorBanner from '../common/ErrorBanner'
import Card from '../common/Card'
import Spinner from '../common/Spinner'

export default function SatelliteTab() {
  const {
    file, previewUrl, prediction, modelInfo, isLoading, error,
    handleFileSelect, handleRemove, handlePredict,
  } = useSatellite()

  return (
    <div className="space-y-6">
      {error && (
        <ErrorBanner message={error} onDismiss={() => handleRemove()} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — upload / detection preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {prediction ? 'Detection Preview' : 'Upload Satellite Image'}
              </h2>
              {prediction && (
                <button
                  onClick={handleRemove}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Upload another
                </button>
              )}
            </div>

            {/* No file yet */}
            {!file && (
              <ImageUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
            )}

            {/* File selected, not yet predicted */}
            {file && !prediction && (
              <div className="space-y-4">
                <ImagePreview file={file} previewUrl={previewUrl} onRemove={handleRemove} />
                <Button
                  variant="primary"
                  onClick={handlePredict}
                  isLoading={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Analyzing…' : '🔍 Detect & Predict Price'}
                </Button>
              </div>
            )}

            {/* After prediction — show image with bounding boxes */}
            {file && prediction && (
              <DetectionCanvas
                imageUrl={previewUrl}
                detections={prediction.detections}
              />
            )}
          </div>

          {/* Detection legend */}
          {prediction?.detections?.length > 0 && (
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

          {/* Model pipeline info */}
          {modelInfo && !prediction && (
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
        </div>

        {/* Right — results */}
        <div>
          {isLoading && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-10 flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-slate-500">Running YOLOv8 detection…</p>
            </div>
          )}

          {!isLoading && !prediction && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-10 flex flex-col items-center text-slate-400">
              <span className="text-4xl mb-3">🛰️</span>
              <p className="text-sm">Upload an aerial image to see feature detection results</p>
            </div>
          )}

          {prediction && <SatelliteResult prediction={prediction} />}
        </div>
      </div>
    </div>
  )
}

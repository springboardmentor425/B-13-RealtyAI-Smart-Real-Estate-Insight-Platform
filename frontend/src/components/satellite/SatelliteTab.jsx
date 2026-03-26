import { useSatellite } from '../../hooks/useSatellite'
import ImageUploader from './ImageUploader'
import ImagePreview from './ImagePreview'
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
        {/* Left — upload */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-5">
              Upload Satellite Image
            </h2>

            {!file ? (
              <ImageUploader onFileSelect={handleFileSelect} isLoading={isLoading} />
            ) : (
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
          </div>

          {/* Model pipeline info */}
          {modelInfo && (
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
          {isLoading && !prediction && (
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

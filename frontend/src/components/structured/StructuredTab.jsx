import { usePrediction } from '../../hooks/usePrediction'
import HouseForm from './HouseForm'
import PredictionResult from './PredictionResult'
import ModelInfoPanel from './ModelInfoPanel'
import ErrorBanner from '../common/ErrorBanner'

export default function StructuredTab() {
  const {
    formValues, prediction, modelInfo, isLoading, error,
    handleChange, handleSubmit, handleReset,
  } = usePrediction()

  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onDismiss={() => handleReset()} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — form */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-5">
            House Details
          </h2>
          <HouseForm
            values={formValues}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            isLoading={isLoading}
          />
        </div>

        {/* Right — result + model info */}
        <div className="space-y-4">
          <PredictionResult prediction={prediction} isLoading={isLoading} />
          <ModelInfoPanel modelInfo={modelInfo} />
        </div>
      </div>
    </div>
  )
}

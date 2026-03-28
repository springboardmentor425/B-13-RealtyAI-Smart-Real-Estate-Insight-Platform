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
    <div className="space-y-6 animate-fade-up">
      {error && <ErrorBanner message={error} onDismiss={() => handleReset()} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — form */}
        <div className="glass p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-slate-400" style={{ letterSpacing: '0.12em' }}>
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
        <div className="space-y-6">
          <PredictionResult prediction={prediction} isLoading={isLoading} />
          <ModelInfoPanel modelInfo={modelInfo} />
        </div>
      </div>
    </div>
  )
}

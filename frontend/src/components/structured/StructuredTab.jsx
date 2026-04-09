import { useEffect } from 'react'
import { usePrediction } from '../../hooks/usePrediction'
import { usePredictionHistory } from '../../hooks/usePredictionHistory'
import HouseForm from './HouseForm'
import PredictionResult from './PredictionResult'
import ModelInfoPanel from './ModelInfoPanel'
import PredictionHistory from '../common/PredictionHistory'
import ErrorBanner from '../common/ErrorBanner'

export default function StructuredTab() {
  const {
    formValues, prediction, modelInfo, isLoading, error,
    handleChange, handleSubmit, handleReset,
  } = usePrediction()

  const { history, addEntry, clearHistory } = usePredictionHistory()

  // Save every new structured prediction to history
  useEffect(() => {
    if (!prediction) return
    const qual  = formValues.OverallQual ? `Q${formValues.OverallQual}` : ''
    const area  = formValues.GrLivArea   ? `${formValues.GrLivArea}sqft` : ''
    const label = [qual, area].filter(Boolean).join(' · ') || 'Ames Housing'
    addEntry({ type: 'structured', label, price: prediction.predicted_price })
  }, [prediction]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <PredictionHistory history={history} onClear={clearHistory} />
        </div>
      </div>
    </div>
  )
}

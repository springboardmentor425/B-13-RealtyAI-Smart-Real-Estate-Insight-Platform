import Card from '../common/Card'
import PriceDisplay from '../common/PriceDisplay'
import Spinner from '../common/Spinner'

export default function PredictionResult({ prediction, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-500">Predicting…</p>
        </div>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
          <span className="text-4xl mb-3">💰</span>
          <p className="text-sm">Fill in the form and click Predict Price</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-up">
      <PriceDisplay price={prediction.predicted_price} label="Predicted Sale Price" size="lg" />
      <p className="text-center text-xs text-slate-400 mt-3">
        XGBoost · Ames Housing Dataset · {prediction.currency}
      </p>
    </Card>
  )
}

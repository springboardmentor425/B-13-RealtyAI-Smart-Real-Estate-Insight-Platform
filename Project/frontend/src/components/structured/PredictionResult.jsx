import Card from '../common/Card'
import PriceDisplay from '../common/PriceDisplay'
import Spinner from '../common/Spinner'

export default function PredictionResult({ prediction, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full animate-spin-slow border-2 border-slate-100 border-t-blue-500" />
            <div className="absolute inset-1 rounded-full bg-slate-50" />
          </div>
          <p className="text-sm font-medium text-slate-500">Predicting…</p>
        </div>
      </Card>
    )
  }

  if (!prediction) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-float text-5xl mb-4">💰</div>
          <p className="text-sm font-medium text-slate-500">Fill in the form and click Predict Price</p>
          <p className="text-xs mt-2 text-slate-400">All fields are optional</p>
        </div>
      </Card>
    )
  }

  return (
    <Card accent className="animate-fade-up">
      <PriceDisplay price={prediction.predicted_price} label="Predicted Sale Price" size="lg" />
      <div className="mt-4 pt-4 flex items-center justify-center gap-2 border-t border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <p className="text-xs font-semibold text-slate-400">
          XGBoost · Ames Housing · {prediction.currency}
        </p>
      </div>
    </Card>
  )
}

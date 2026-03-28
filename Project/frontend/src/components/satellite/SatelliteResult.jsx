import Card from '../common/Card'
import PriceDisplay from '../common/PriceDisplay'
import FeatureScores from './FeatureScores'

export default function SatelliteResult({ prediction }) {
  if (!prediction) return null

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 gap-4">
        <Card accent>
          <PriceDisplay
            price={prediction.predicted_price}
            label="ML Model Price"
            size="lg"
          />
        </Card>
        <Card>
          <PriceDisplay
            price={prediction.formula_price}
            label="Formula Price"
            size="sm"
          />
          <p className="text-center text-xs mt-3 text-slate-400">
            Based on detection weights
          </p>
        </Card>
      </div>

      <FeatureScores detectedFeatures={prediction.detected_features} />

      <p className="text-xs italic px-2 text-slate-500">{prediction.note}</p>
    </div>
  )
}

import Card from '../common/Card'
import ConfidenceBar from './ConfidenceBar'

export default function FeatureScores({ detectedFeatures }) {
  const sorted = Object.entries(detectedFeatures).sort(([, a], [, b]) => b - a)

  return (
    <Card title="Detected Features">
      <div className="space-y-3">
        {sorted.map(([feature, score]) => (
          <ConfidenceBar key={feature} feature={feature} score={score} />
        ))}
      </div>
    </Card>
  )
}

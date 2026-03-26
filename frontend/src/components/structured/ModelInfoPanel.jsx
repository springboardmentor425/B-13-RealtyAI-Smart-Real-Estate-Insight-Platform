import Card from '../common/Card'
import { formatCurrency } from '../../utils/formatCurrency'

function MetricStat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-base font-bold text-slate-800 font-mono">{value}</p>
    </div>
  )
}

export default function ModelInfoPanel({ modelInfo }) {
  if (!modelInfo) return null

  const { metrics, top_features, algorithm, dataset, total_features } = modelInfo

  return (
    <div className="space-y-4">
      <Card title="Model Performance">
        <div className="grid grid-cols-2 gap-3">
          <MetricStat label="R² Score"  value={(metrics.r2 * 100).toFixed(1) + '%'} />
          <MetricStat label="MAPE"      value={metrics.mape?.toFixed(2) + '%'} />
          <MetricStat label="MAE"       value={formatCurrency(metrics.mae)} />
          <MetricStat label="RMSE"      value={formatCurrency(metrics.rmse)} />
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          {algorithm} · {total_features} features · {dataset}
        </p>
      </Card>

      <Card title="Top Feature Importances">
        <div className="space-y-2">
          {top_features.map(({ feature, importance }) => (
            <div key={feature}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="truncate mr-2">{feature}</span>
                <span className="font-mono shrink-0">{(importance * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${importance * 100 * 4}%`, maxWidth: '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

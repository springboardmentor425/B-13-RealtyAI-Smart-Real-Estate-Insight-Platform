import Card from '../common/Card'
import { formatCurrency } from '../../utils/formatCurrency'

function MetricStat({ label, value, accent }) {
  return (
    <div className="stat-card p-4 text-center">
      <p className="text-xs uppercase tracking-wider mb-2 font-bold text-slate-400" style={{ letterSpacing: '0.1em' }}>{label}</p>
      <p className={`text-lg font-bold ${accent ? 'text-blue-600' : 'text-slate-700'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
    </div>
  )
}

export default function ModelInfoPanel({ modelInfo }) {
  if (!modelInfo) return null

  const { metrics, top_features, algorithm, dataset, total_features } = modelInfo
  const maxImportance = Math.max(...top_features.map(f => f.importance))

  return (
    <div className="space-y-4 animate-fade-up">
      <Card title="Model Performance" accent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <MetricStat label="R² Score" value={(metrics.r2 * 100).toFixed(1) + '%'} accent />
          <MetricStat label="MAPE"     value={metrics.mape?.toFixed(2) + '%'} />
          <MetricStat label="MAE"      value={formatCurrency(metrics.mae)} />
          <MetricStat label="RMSE"     value={formatCurrency(metrics.rmse)} />
        </div>
        <p className="text-xs text-center text-slate-400 font-medium">
          {algorithm} · {total_features} features · {dataset}
        </p>
      </Card>

      <Card title="Top Feature Importances">
        <div className="space-y-3">
          {top_features.map(({ feature, importance }, i) => {
            const pct = (importance / maxImportance) * 100
            const width = `${pct}%`
            const hue = 210 + i * 5
            return (
              <div key={feature}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600">{feature}</span>
                  <span className="text-blue-600 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(importance * 100).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width, background: `linear-gradient(90deg, hsl(${hue},80%,65%), hsl(${hue+30},90%,70%))` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 animate-fade-up">
      <span className="text-lg leading-none">⚠️</span>
      <p className="flex-1 text-sm">{message}</p>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
    </div>
  )
}

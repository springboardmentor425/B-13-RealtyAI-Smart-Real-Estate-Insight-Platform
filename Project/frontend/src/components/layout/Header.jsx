export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated logo icon */}
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <span className="text-xl">🏠</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-800">House Price AI</h1>
            <p className="text-xs text-slate-500 font-medium">Ames Housing · Satellite Imagery · v2.0</p>
          </div>
        </div>


      </div>
    </header>
  )
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-400">
        <span>House Price AI · v2.0.0</span>
        <div className="flex items-center gap-4">
          <span>FastAPI · XGBoost · YOLOv8 · React</span>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
          >
            API Docs →
          </a>
        </div>
      </div>
    </footer>
  )
}

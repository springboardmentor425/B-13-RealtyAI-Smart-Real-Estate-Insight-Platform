const YEAR = new Date().getFullYear()

const STACK = [
  { label: 'FastAPI',   href: 'https://fastapi.tiangolo.com' },
  { label: 'XGBoost',   href: 'https://xgboost.readthedocs.io' },
  { label: 'YOLOv8',    href: 'https://docs.ultralytics.com' },
  { label: 'React',     href: 'https://react.dev' },
  { label: 'Leaflet',   href: 'https://leafletjs.com' },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">

          <span className="font-medium">
            House Price AI &copy; {YEAR}
          </span>

          {/* Stack links */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {STACK.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-600 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* API docs */}
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
          >
            API Docs →
          </a>
        </div>
      </div>
    </footer>
  )
}

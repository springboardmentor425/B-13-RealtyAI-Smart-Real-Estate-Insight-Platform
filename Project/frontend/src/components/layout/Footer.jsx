export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>House Price AI</span>
        <div className="flex items-center gap-5">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            API Docs →
          </a>
        </div>
      </div>
    </footer>
  )
}

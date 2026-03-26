export default function ImagePreview({ file, previewUrl, onRemove }) {
  const sizeFmt = file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(0)} KB`
    : `${(file.size / 1024 / 1024).toFixed(1)} MB`

  return (
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
      <img
        src={previewUrl}
        alt="satellite preview"
        className="w-20 h-20 object-cover rounded-lg shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">{sizeFmt}</p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors text-sm"
      >
        ✕
      </button>
    </div>
  )
}

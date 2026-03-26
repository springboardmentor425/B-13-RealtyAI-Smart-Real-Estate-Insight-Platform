import { useRef, useState } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']

export default function ImageUploader({ onFileSelect, isLoading }) {
  const inputRef  = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && ACCEPTED.includes(file.type)) onFileSelect(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
        dragOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      <div className="text-5xl mb-3">🛰️</div>
      <p className="font-medium text-slate-700">Drop a satellite image here</p>
      <p className="text-sm text-slate-400 mt-1">or click to browse</p>
      <p className="text-xs text-slate-300 mt-3">JPEG · PNG · WEBP · TIFF</p>
    </div>
  )
}

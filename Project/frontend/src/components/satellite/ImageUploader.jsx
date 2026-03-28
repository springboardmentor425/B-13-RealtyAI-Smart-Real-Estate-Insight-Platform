import { useRef, useState } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']

export default function ImageUploader({ onFileSelect, isLoading }) {
  const inputRef  = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (isLoading) return
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isLoading) setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`group relative flex flex-col items-center justify-center p-12 overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragOver ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp"
        onChange={(e) => {
          if (e.target.files?.[0]) onFileSelect(e.target.files[0])
        }}
        className="hidden"
        disabled={isLoading}
      />
      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-50 transition-opacity" />
      <span className="text-5xl mb-4 text-blue-500 group-hover:scale-110 transition-transform duration-300 transform">📤</span>
      <p className="text-sm font-semibold text-slate-600">Click to upload or drag & drop</p>
      <p className="text-xs font-medium text-slate-400 mt-2">Supports JPG, PNG, WEBP (max 10MB)</p>
    </div>
  )
}

import { useEffect, useRef } from 'react'

// Actual hex colors for each feature (mirrors Tailwind classes in constants.js)
const FEATURE_HEX = {
  'Swimming Pools': '#06b6d4',  // cyan-500
  'Waterbodies':    '#3b82f6',  // blue-500
  'Gardens':        '#22c55e',  // green-500
  'Boats':          '#6366f1',  // indigo-500
  'Parking Space':  '#64748b',  // slate-500
  'Solar Panels':   '#eab308',  // yellow-500
  'Tennis Court':   '#f97316',  // orange-500
}

function drawDetections(canvas, img, detections) {
  const { offsetWidth: w, offsetHeight: h } = img
  canvas.width  = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)

  for (const det of detections) {
    const [x1, y1, x2, y2] = det.bbox
    const color = FEATURE_HEX[det.feature] ?? '#ffffff'

    const px = x1 * w
    const py = y1 * h
    const pw = (x2 - x1) * w
    const ph = (y2 - y1) * h

    // Bounding box
    ctx.strokeStyle = color
    ctx.lineWidth   = 2.5
    ctx.strokeRect(px, py, pw, ph)

    // Slightly transparent fill
    ctx.fillStyle = color + '22'   // hex alpha ~13%
    ctx.fillRect(px, py, pw, ph)

    // Label text
    const label = `${det.feature}  ${(det.confidence * 100).toFixed(0)}%`
    ctx.font = 'bold 11px Inter, ui-sans-serif, sans-serif'
    const textW = ctx.measureText(label).width

    // Label pill background
    const lx = px
    const ly = py > 20 ? py - 20 : py + ph + 2
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(lx, ly, textW + 10, 18, 4)
    ctx.fill()

    // Label text
    ctx.fillStyle = '#ffffff'
    ctx.fillText(label, lx + 5, ly + 13)
  }
}

export default function DetectionCanvas({ imageUrl, detections }) {
  const imgRef    = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const img    = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas || !detections?.length) return

    const draw = () => drawDetections(canvas, img, detections)

    if (img.complete && img.naturalWidth > 0) draw()
    else img.onload = draw

    // Redraw on window resize so boxes stay aligned
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [detections, imageUrl])

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-900">
      <img
        ref={imgRef}
        src={imageUrl}
        alt="satellite with detections"
        className="w-full block rounded-xl"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
      {detections?.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
          <p className="text-white text-sm font-medium">No objects detected</p>
        </div>
      )}
    </div>
  )
}

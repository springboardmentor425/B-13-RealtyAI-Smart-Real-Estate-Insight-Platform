import { useState, useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function PriceDisplay({ price, label = 'Predicted Price', size = 'lg' }) {
  const [displayed, setDisplayed] = useState(price * 0.6)
  const rafRef = useRef(null)

  useEffect(() => {
    const start    = price * 0.6
    const end      = price
    const duration = 1200
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayed(start + (end - start) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [price])

  const textSize = size === 'lg' ? 'text-4xl' : 'text-2xl'

  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`${textSize} font-bold text-blue-700 font-mono tabular-nums`}>
        {formatCurrency(displayed)}
      </p>
    </div>
  )
}

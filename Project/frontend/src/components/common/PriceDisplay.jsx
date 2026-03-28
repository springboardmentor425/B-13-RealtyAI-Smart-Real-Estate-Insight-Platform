import { useState, useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'

export default function PriceDisplay({ price, label = 'Predicted Price', size = 'lg' }) {
  const [displayed, setDisplayed] = useState(price * 0.5)
  const rafRef = useRef(null)

  useEffect(() => {
    const start    = price * 0.5
    const end      = price
    const duration = 1400
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayed(start + (end - start) * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [price])

  const textSize = size === 'lg' ? 'text-5xl' : 'text-3xl'

  return (
    <div className="text-center py-4 animate-fade-up">
      <div className="relative inline-block">
        <p className="text-xs font-bold uppercase tracking-widest mb-2 text-slate-500" style={{ letterSpacing: '0.14em' }}>
          {label}
        </p>
        <p className={`${textSize} font-bold text-blue-600`} style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>
          {formatCurrency(displayed)}
        </p>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { useToast } from '../../contexts/ToastContext'

export default function PriceDisplay({ price, label = 'Predicted Price', size = 'lg' }) {
  const [displayed, setDisplayed] = useState(price * 0.6)
  const [copied,    setCopied]    = useState(false)
  const rafRef = useRef(null)
  const toast  = useToast()

  useEffect(() => {
    const start     = price * 0.6
    const end       = price
    const duration  = 1200
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatCurrency(price))
      setCopied(true)
      toast.success('Price copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  const textSize = size === 'lg' ? 'text-4xl' : 'text-2xl'

  return (
    <div className="text-center group">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`${textSize} font-bold text-blue-700 font-mono tabular-nums`}>
        {formatCurrency(displayed)}
      </p>
      <button
        onClick={handleCopy}
        className="mt-2 text-xs text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
        title="Copy price"
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}

import Spinner from './Spinner'

export default function Button({
  variant = 'primary', isLoading = false, disabled = false,
  onClick, children, type = 'button', className = '',
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer disabled:cursor-not-allowed transition-all duration-200'

  const cls = variant === 'primary'
    ? `${base} btn-primary ${className}`
    : variant === 'danger'
    ? `${base} bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 ${className}`
    : `${base} btn-ghost ${className}`

  const dangerStyle = {}

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cls}
      style={dangerStyle}
    >
      {isLoading && <Spinner size="sm" color="text-white" />}
      {children}
    </button>
  )
}

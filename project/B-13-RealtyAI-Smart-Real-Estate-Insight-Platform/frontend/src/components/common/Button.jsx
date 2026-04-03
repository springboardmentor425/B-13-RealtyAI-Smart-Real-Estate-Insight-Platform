import Spinner from './Spinner'

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300',
  secondary: 'border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50',
  danger:    'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300',
}

export default function Button({
  variant = 'primary', isLoading = false, disabled = false,
  onClick, children, type = 'button', className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {isLoading && <Spinner size="sm" color={variant === 'primary' ? 'text-white' : 'text-blue-600'} />}
      {children}
    </button>
  )
}

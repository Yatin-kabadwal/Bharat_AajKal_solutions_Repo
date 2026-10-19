import { Loader2 } from 'icons/lucide-react'
import { clsx, clsxJoin } from 'ui/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'overlay' | 'inline'
  message?: string
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  message = 'Loading...',
  className
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 className={clsx('text-primary-700 animate-spin', sizeClasses[size])} />
      {message && <p className="animate-pulse text-sm font-medium">{message}</p>}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div
        className={clsxJoin(
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-background/80 backdrop-blur-xs',
          className
        )}>
        <div className="rounded-lg border p-8 shadow-lg">{spinnerContent}</div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        <Loader2 className={clsx('text-primary-700 animate-spin', sizeClasses[size])} />
        {message && <span className="text-sm">{message}</span>}
      </div>
    )
  }

  return <div className={clsx('flex items-center justify-center p-8', className)}>{spinnerContent}</div>
}

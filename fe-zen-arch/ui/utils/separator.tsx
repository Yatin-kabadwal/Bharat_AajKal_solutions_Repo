import { clsxJoin } from 'ui/utils'

interface SeparatorProps {
  size?: number
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Separator({ className, orientation = 'horizontal', size = 1 }: SeparatorProps) {
  const customSize = className?.includes(orientation === 'horizontal' ? 'w-' : 'h-')

  return (
    <div
      className={clsxJoin(
        'shrink-0 bg-gray-200',
        !customSize && (orientation === 'horizontal' ? 'w-full' : 'h-full'),
        className
      )}
      style={orientation === 'horizontal' ? { height: `${size}px` } : { width: `${size}px` }}
    />
  )
}

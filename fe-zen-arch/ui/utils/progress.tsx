interface Progress extends React.ComponentProps<'div'> {
  value: number
  max?: number
}

export function Progress({ value, max = 100, className, ...props }: Progress) {
  // Ensure value is within bounds
  const clampedValue = Math.min(Math.max(value, 0), max)

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`relative w-full overflow-hidden rounded bg-gray-200 ${className ?? ''}`}
      {...props}>
      {/* Progress indicator */}
      <div
        className="bg-primary-500 absolute top-0 left-0 h-full transition-all"
        style={{ width: `${(clampedValue / max) * 100}%` }}
      />
      {/* {children && (
        <div className="relative z-10 flex h-full items-center justify-center text-sm text-gray-900">{children}</div>
      )} */}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { clsx } from 'ui/utils'

interface SliderProps {
  // min & max must be number, added string also, for better compatibility with react hook form & html types
  // but inside component they are passed & used as number only
  min?: number | string
  max?: number | string
  step?: number
  defaultValue?: number
  value?: number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  showValue?: boolean
  showTooltip?: boolean
  disabled?: boolean
  className?: string
  ref?: React.Ref<HTMLInputElement>
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 0,
  value: controlledValue,
  onChange,
  disabled = false,
  showValue = false,
  showTooltip = false,
  className,
  ...props
}: SliderProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = isControlled ? controlledValue : internalValue
  const [showTooltipValue, setShowTooltipValue] = useState(false)
  const valueWidth = useMemo(() => (showValue ? max.toString().length * 8 : 0), [max])

  const percentage = ((value - (min as number)) / ((max as number) - (min as number))) * 100

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = Number(e.target.value)
    if (!isControlled) setInternalValue(newValue)
    onChange?.(e)
  }

  function handleMouseEnter() {
    if (showTooltip) setShowTooltipValue(true)
  }

  function handleMouseLeave() {
    if (showTooltip) setShowTooltipValue(false)
  }

  return (
    <div className={clsx('flex w-full items-center', className)}>
      {showValue && (
        // Keep width static based on max value, to avoid constant layout shifting during sliding
        <div className="mr-2 text-sm font-medium text-gray-900" style={{ width: valueWidth }}>
          {value}
        </div>
      )}

      {/* Keep inside a separate dev for proper tooltip positioning */}
      <div className="relative w-full">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
          {...props}
        />

        {showTooltipValue && (
          <div
            className="pointer-events-none absolute -top-6 -translate-x-1/2 rounded bg-gray-950 px-2 py-1 text-xs text-gray-50"
            style={{ left: `${percentage}%` }}>
            {value}
          </div>
        )}
      </div>
    </div>
  )
}

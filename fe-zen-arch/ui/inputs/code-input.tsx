import { useState } from 'react'
import { cva } from 'ui/utils'

const codeInputVariants = cva('flex items-center justify-center rounded border', {
  variants: {
    size: {
      base: 'size-9 text-base',
      xl: 'size-12 text-xl font-medium'
    }
  },
  defaultVariants: {
    size: 'xl'
  }
})

interface CodeInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  disabled?: boolean
  onComplete?: (otp: string) => void
  length?: 6 | 4
  initialFocus?: boolean
  size?: 'base' | 'xl'
}

export function CodeInput({ length = 6, initialFocus = false, size, onComplete, inputRef, disabled }: CodeInputProps) {
  const [otp, setOtp] = useState<string>('')
  const [focused, setFocused] = useState<boolean>(initialFocus)

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, length) // Allow only digits upto n length
    setOtp(value)

    // Call onComplete when all inputs are filled
    if (value.length == length && onComplete) onComplete(value)
  }

  // Handle blur (set out of focus) when escape key is pressed
  function onInputKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key == 'Escape') (event.target as HTMLInputElement).blur()
  }

  return (
    <div className="flex justify-center gap-2" onClick={(_) => inputRef.current?.focus()}>
      {/* Hidden input for capturing OTP */}
      <input
        type="text"
        value={otp}
        onChange={onInputChange}
        onBlur={(_) => setFocused(false)}
        onFocus={(_) => setFocused(true)}
        onKeyDown={onInputKeydown}
        ref={inputRef}
        className="sr-only"
        maxLength={length}
        aria-label="Enter OTP"
        autoFocus={initialFocus}
        disabled={disabled}
      />
      {/* OTP boxes */}
      {Array.from({ length }).map((_, index) => (
        <div
          key={index}
          className={codeInputVariants({
            size: size,
            className: [
              otp[index] ? 'border-primary-500' : 'border-gray-500',
              focused && otp.length === index && 'ring-primary-500 ring-2'
            ]
          })}>
          {otp[index] || ''}
        </div>
      ))}
    </div>
  )
}

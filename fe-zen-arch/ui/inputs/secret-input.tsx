import { RrEye } from 'icons/rr/fi-rr-eye'
import { RrEyeCrossed } from 'icons/rr/fi-rr-eye-crossed'
import { useState } from 'react'
import { Button } from 'ui/basic/button'
import { InputError } from 'ui/inputs/error'
import { Label } from 'ui/inputs/label'
import { clsxJoin } from 'ui/utils'

interface SecretInputProps {
  name?: string
  id?: string
  label?: string
  description?: string
  wrapClass?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  ref?: React.Ref<HTMLInputElement>
}

export function SecretInput({ className, label, description, wrapClass, name, ...props }: SecretInputProps) {
  const [showSecret, setShowSecret] = useState(false)
  const id = props.id ?? name

  return (
    <div className={wrapClass}>
      {label && (
        <Label htmlFor={id} className="mb-1.5 block">
          {label}
        </Label>
      )}
      {description && <p className="mb-1.5 text-xs text-gray-500">{description}</p>}
      <div className="relative">
        <input
          {...props}
          name={name}
          id={id}
          className={clsxJoin(
            'outline-focus-input w-full rounded-md border bg-inherit px-3 py-2 pr-10 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50',
            !showSecret && 'secure-input',
            className
          )}
          autoComplete="off"
          spellCheck="false"
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1/2 right-0 h-full -translate-y-1/2 px-3 hover:bg-transparent"
          onClick={() => setShowSecret(!showSecret)}
          aria-label={showSecret ? 'Hide password' : 'Show password'}>
          {showSecret ? <RrEyeCrossed className="size-4 text-gray-500" /> : <RrEye className="size-4 text-gray-500" />}
        </Button>
      </div>
      {/* @ts-expect-error */}
      <InputError name={name} />
    </div>
  )
}

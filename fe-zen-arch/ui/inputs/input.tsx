import { clsx } from 'ui/utils'
import { InputError } from './error'
import { Label } from './label'

interface TextInputProps {
  name?: string
  id?: string
  label?: string
  description?: string
  wrapClass?: string
  value?: string | number
  className?: string
  type?: 'text' | 'number' | 'email' | 'url' | 'password' | 'tel'
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | undefined
  onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined
  ref?: React.Ref<HTMLInputElement>
}

export function Input({ description, label, wrapClass, className, name, ...props }: TextInputProps) {
  const id = props.id ?? name

  return (
    <div className={wrapClass}>
      {label && (
        <Label className="mb-1.5 block" htmlFor={id}>
          {label}
        </Label>
      )}
      {description && <p className="text-xs text-gray-800">{description}</p>}
      <input
        className={clsx(
          'outline-focus-input w-full rounded-md border bg-inherit px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        name={name}
        id={id}
        {...props}
      />
      {/* @ts-expect-error */}
      <InputError name={name} />
    </div>
  )
}

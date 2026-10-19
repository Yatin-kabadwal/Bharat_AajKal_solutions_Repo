import { clsx } from 'ui/utils'
import { InputError } from './error'
import { Label } from './label'

interface TextareaProps extends React.ComponentProps<'textarea'> {
  label?: string
  wrapClass?: string
  ref?: React.Ref<HTMLTextAreaElement>
}

export function Textarea({ className, name, label, wrapClass, ...props }: TextareaProps) {
  return (
    <div className={wrapClass}>
      {label && (
        <Label className="mb-1.5" htmlFor={props.id}>
          {label}
        </Label>
      )}
      <textarea
        name={name}
        className={clsx(
          'outline-focus-input flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 shadow-xs disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      {/* @ts-expect-error */}
      <InputError name={name} />
    </div>
  )
}

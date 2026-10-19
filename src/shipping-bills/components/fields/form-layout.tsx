import { ReactNode, useState } from 'react'
import { useBillForm } from '../../hooks/use-bill-form-context'

export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  )
}

function hasFieldError(errors: object, path: string): boolean {
  const found = path
    .split('.')
    .reduce<unknown>((current, key) => (current as Record<string, unknown> | undefined)?.[key], errors)
  return found != null
}

interface AdvancedProps {
  title: string
  children: ReactNode
  /** Start open, e.g. because the hidden inputs already hold values. */
  defaultOpen?: boolean
  /** Field paths inside the block. When one has an error the block opens, so the error is never hidden. */
  openOnError?: string[]
}

/** Collapsible block for rarely used inputs. */
export function Advanced({ title, children, defaultOpen = false, openOnError = [] }: AdvancedProps) {
  const { formState } = useBillForm()
  const [open, setOpen] = useState(defaultOpen)
  const hasError = openOnError.some((path) => hasFieldError(formState.errors, path))

  return (
    <details
      className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
      open={open || hasError}
      onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-medium text-gray-700">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

interface PersistentTabProps {
  active: boolean
  children: ReactNode
}

// Inactive tabs are hidden, not unmounted: their inputs stay registered, so one submit validates the
// whole bill and the values of every tab are kept while the user moves around.
export function PersistentTab({ active, children }: PersistentTabProps) {
  return (
    <div role="tabpanel" hidden={!active} className="mt-3 space-y-4">
      {children}
    </div>
  )
}

/** Label + remove button on top of a repeated group (an invoice, an item, a container...). */
export function RepeatedBlock({
  title,
  onRemove,
  children,
  className = 'rounded-lg border border-gray-200 p-4'
}: {
  title: string
  onRemove?: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {onRemove && (
          <button type="button" className="text-sm text-gray-500 hover:underline" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

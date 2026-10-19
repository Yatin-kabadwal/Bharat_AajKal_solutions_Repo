import { useDebouncedValue } from '@/shared/use-debounced-value'
import { queryClient, useQuery } from 'core/react-query'
import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useState } from 'react'
import { getFormContext, Path, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Label } from 'ui/inputs/label'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { Spinner } from 'ui/notify/spinner'
import { clsx, getContext } from 'ui/utils'
import type { ShippingBillFormValues } from '../../domain/types'
import type { Lookup, LookupOption } from '../../hooks/lookups'

interface RemoteSelectProps {
  name: Path<ShippingBillFormValues>
  lookup: Lookup
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  /** Called with the new value after the user picks an option. */
  onSelect?: (value: string) => void
}

/**
 * A searchable select whose options come from a `Lookup` (the data layer), not from a list in the
 * component. It shows loading, error (with retry) and empty states, and resolves the label of an
 * already selected value, which may not be in the current search results.
 */
export function RemoteSelect({
  name,
  lookup,
  label,
  placeholder = 'Search...',
  disabled,
  required,
  onSelect
}: RemoteSelectProps) {
  const ctx = getFormContext<ShippingBillFormValues>()
  const { field } = useController({ name, control: ctx.hooks.control, rules: { required: !!required }, disabled })
  const value = typeof field.value === 'string' ? field.value : ''

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const results = useQuery({
    queryKey: [...lookup.key, 'search', debouncedSearch],
    queryFn: () => lookup.search(debouncedSearch),
    // Only hit the API once the user opens the list.
    enabled: isOpen
  })
  const selected = useQuery({
    queryKey: [...lookup.key, 'label', value],
    queryFn: () => lookup.label(value),
    enabled: value !== ''
  })

  function pick(option: LookupOption) {
    queryClient.setQueryData([...lookup.key, 'label', option.value], option.label)
    field.onChange(option.value)
    onSelect?.(option.value)
    setSearch('')
  }

  const triggerText = value === '' ? null : selected.isPending ? 'Loading...' : (selected.data ?? value)

  return (
    <div>
      {label && <Label className="mb-1.5 block">{label}</Label>}
      <input type="hidden" name={name} value={value} ref={field.ref} disabled={disabled} />
      <Popover placement="bottom-start" fallbackPlacements={['top-start']} onOpenCallback={setIsOpen}>
        <PopoverTrigger
          className="outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border pr-2"
          style={disabled ? { cursor: 'not-allowed', opacity: 0.5 } : undefined}
          disabled={disabled}>
          <div className="flex items-center p-2 text-sm">
            <span className="text-gray-700">{triggerText ?? placeholder}</span>
          </div>
          <RrCaretDown className="size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <InputError name={name} />
        <PopoverContent className="w-72 overflow-hidden">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Type to search..."
              aria-label="Search options"
              className="focus:border-primary-500 focus:ring-primary-500 w-full rounded border bg-transparent px-2.5 py-1.5 text-sm outline-none focus:ring-1"
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {results.isPending ? (
              <Status>
                <Spinner size="sm" /> Searching...
              </Status>
            ) : results.isError ? (
              <Status>
                Could not load the options.
                <button
                  type="button"
                  className="text-primary-700 font-medium hover:underline"
                  onClick={() => results.refetch()}>
                  Try again
                </button>
              </Status>
            ) : results.data.length === 0 ? (
              <Status>No matching results</Status>
            ) : (
              results.data.map((option) => (
                <OptionItem key={option.value} option={option} selected={option.value === value} onPick={pick} />
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function Status({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-2 p-3 text-center text-xs text-gray-500">{children}</div>
}

function OptionItem({
  option,
  selected,
  onPick
}: {
  option: LookupOption
  selected: boolean
  onPick: (option: LookupOption) => void
}) {
  const { setOpen } = getContext(PopoverContext)

  return (
    <button
      type="button"
      onClick={() => {
        onPick(option)
        setOpen(false)
      }}
      className={clsx(
        'flex w-full cursor-pointer flex-col rounded p-2 text-left text-sm transition-colors',
        selected ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-gray-950 hover:bg-gray-100'
      )}>
      <span>{option.label}</span>
      {option.sublabel && <span className="text-xs font-normal text-gray-500">{option.sublabel}</span>}
    </button>
  )
}

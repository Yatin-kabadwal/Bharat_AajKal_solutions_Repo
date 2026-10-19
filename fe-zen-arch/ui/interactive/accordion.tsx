import { RrAngleSmallDown } from 'icons/rr/fi-rr-angle-small-down'
import { createContext, useState } from 'react'
import { clsx, getContext } from 'ui/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

interface AccordionContextType<T = string | Set<string>> {
  multi: boolean
  onValueChange: (id: string) => void
  openValue?: T
}

// Context for managing accordion state
const AccordionContext = createContext<AccordionContextType | null>(null)

interface AccordionProps<T = string | Set<string>> {
  children: React.ReactNode
  multi?: boolean
  value?: T
  onValueChange?(ids?: T): void
  defaultValue?: T
  className?: string
}

// eslint-disable-next-line @typescript-eslint/unbound-method
export function Accordion({ multi = false, defaultValue, value, onValueChange, children, ...props }: AccordionProps) {
  const [open, setOpen] = value && onValueChange ? [value, onValueChange] : useState(defaultValue)

  function __onChange(id: string | undefined) {
    if (id == null) throw new Error('id is required in AccordionItem component')
    if (multi) {
      const allOpenIds = new Set(open as Set<string> | null)
      if (allOpenIds.has(id)) allOpenIds.delete(id)
      else allOpenIds.add(id)
      setOpen(allOpenIds)
    } else {
      setOpen(id == open ? undefined : id)
    }
    if (value == null) onValueChange?.(open)
  }

  return (
    <AccordionContext.Provider value={{ multi, onValueChange: __onChange, openValue: open }}>
      <div {...props}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ id, children, className, ...props }: AccordionItemProps) {
  const { onValueChange, openValue, multi } = getContext(AccordionContext)

  const open = multi ? (openValue as Set<string> | null)?.has(id) : (openValue as string | null) == id

  return (
    <Collapsible
      isOpen={open}
      onClick={() => onValueChange(id)}
      className={clsx('border-b', className)}
      data-open={open}
      {...props}>
      {children}
    </Collapsible>
  )
}

interface AccordionInnerItemsProps {
  children: React.ReactNode
  className?: string
}

export function AccordionTrigger({ children, ...props }: AccordionInnerItemsProps) {
  return (
    <CollapsibleTrigger {...props} className="flex">
      <button type="button" className="flex flex-1 items-center justify-between py-4 font-medium transition-all">
        {children}
        <RrAngleSmallDown className="collapsible-arrow dark size-4 shrink-0 transition-transform duration-200" />
      </button>
    </CollapsibleTrigger>
  )
}

export function AccordionContent({ children, className, ...props }: AccordionInnerItemsProps) {
  return (
    <CollapsibleContent {...props} className="overflow-hidden text-sm">
      <div className={clsx('pt-0 pb-4', className)}>{children}</div>
    </CollapsibleContent>
  )
}

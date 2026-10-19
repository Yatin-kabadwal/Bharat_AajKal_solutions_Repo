import { FloatingFocusManager, FloatingPortal } from '@floating-ui/react'
import { cloneElement, isValidElement } from 'react'
import { clsx, getContext } from 'ui/utils'
import { PopoverContext, PopoverOptions, usePopover } from './popover-context'

const MODEL = false // Details: https://floating-ui.com/docs/popover#modal-and-non-modal-behavior

interface PopoverProps extends PopoverOptions {
  children: React.ReactNode
}

// This can accept any props as options, e.g. `placement`, or other positioning options.
export function Popover({ children, ...props }: PopoverProps) {
  const popover = usePopover(props)
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>
}

interface PopoverTriggerProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  asChild?: boolean
  style?: React.CSSProperties
}

export function PopoverTrigger({ children, asChild, ...props }: PopoverTriggerProps) {
  const context = getContext(PopoverContext)

  // `asChild` allows the user to pass any element as the anchor
  if (asChild) {
    if (import.meta.env.DEV) {
      if (!isValidElement(children)) {
        throw new Error('To use PopoverTrigger child with asChild children must a single valid JSX react element')
      }
    }
    return cloneElement(
      children as React.ReactElement,
      context.getReferenceProps({
        ref: context.refs.setReference,
        ...props,
        // @ts-expect-error
        ...(children as React.ReactElement).props,
        'data-state': context.open ? 'open' : 'closed'
      })
    )
  }

  return (
    <button
      type="button"
      ref={context.refs.setReference}
      data-state={context.open ? 'open' : 'closed'}
      {...context.getReferenceProps(props)}>
      {children}
    </button>
  )
}

interface PopoverContentProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function PopoverContent({ className, ...props }: PopoverContentProps) {
  const { context: floatingContext, ...context } = getContext(PopoverContext)
  if (!floatingContext.open) return null

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={MODEL}>
        <div
          className={clsx(
            'foreground shadow-cxl z-50 rounded-md border text-gray-900 shadow-black/30 outline-hidden dark:shadow-black/70',
            className
          )}
          ref={context.refs.setFloating}
          style={context.floatingStyles}
          {...context.getFloatingProps(props)}>
          {props.children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  )
}

export function PopoverClose(props: React.ComponentProps<'button'>) {
  const { setOpen } = getContext(PopoverContext)
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        props.onClick?.(event)
        setOpen(false)
      }}
    />
  )
}

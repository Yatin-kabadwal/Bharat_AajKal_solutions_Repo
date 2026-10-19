import type { Placement } from '@floating-ui/react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole
} from '@floating-ui/react'
import { cloneElement, createContext, isValidElement, useMemo, useState } from 'react'
import { getContext } from 'ui/utils'

// Source: https://floating-ui.com/docs/tooltip (includes some modifications)

interface TooltipOptions {
  initialOpen?: boolean
  placement?: Placement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function useTooltip({
  initialOpen = false,
  placement = 'top',
  open: _open,
  onOpenChange: _onOpen
}: TooltipOptions = {}) {
  const controlledOpen = _open && _onOpen
  const [open, setOpen] = controlledOpen ? [_open, _onOpen] : useState(initialOpen)

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 5
      }),
      shift({ padding: 5 })
    ]
  })

  const context = data.context

  const hover = useHover(context, { move: false, enabled: controlledOpen == null })
  const focus = useFocus(context, { enabled: controlledOpen == null })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data
    }),
    [open, setOpen, interactions, data]
  )
}

type ContextType = ReturnType<typeof useTooltip> | null

const TooltipContext = createContext<ContextType>(null)

export function Tooltip({ children, ...options }: { children: React.ReactNode } & TooltipOptions) {
  // This can accept any props as options, e.g. `placement`, or other positioning options.
  const tooltip = useTooltip(options)
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function TooltipTrigger({ children, asChild = false, ...props }: TooltipTriggerProps) {
  const context = getContext(TooltipContext)

  // `asChild` allows the user to pass any element as the anchor
  if (asChild) {
    if (import.meta.env.DEV) {
      if (!isValidElement(children)) {
        throw new Error('To use TooltipTrigger with asChild children must a single JSX valid react element')
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
      // The user can style the trigger based on the state
      data-state={context.open ? 'open' : 'closed'}
      {...context.getReferenceProps(props)}>
      {children}
    </button>
  )
}

interface TooltipContentProps {
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export function TooltipContent({ style, ...props }: TooltipContentProps) {
  const context = getContext(TooltipContext)
  if (!context.open) return null

  return (
    <FloatingPortal>
      <div
        ref={context.refs.setFloating}
        style={{
          ...context.floatingStyles,
          ...style
        }}
        {...context.getFloatingProps(props)}
      />
    </FloatingPortal>
  )
}

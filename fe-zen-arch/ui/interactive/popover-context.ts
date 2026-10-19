import {
  autoUpdate,
  flip,
  Middleware,
  offset,
  Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react'
import { createContext, useMemo, useState } from 'react'

export interface PopoverOptions {
  initialOpen?: boolean
  placement?: Placement
  fallbackPlacements?: Placement[]
  modal?: boolean
  open?: boolean
  middleware?: Middleware[]
  onOpenCallback?: (open: boolean) => void
  setOpen?: (open: boolean) => void
}

// Source: https://floating-ui.com/docs/popover (includes some modifications)

export function usePopover({
  placement = 'bottom',
  open: ctrOpen,
  setOpen: ctrSetOpen,
  middleware: propMiddleware,
  ...props
}: PopoverOptions = {}) {
  const [open, setOpen] = ctrOpen && ctrSetOpen ? [ctrOpen, ctrSetOpen] : useState(props.initialOpen ?? false)

  const middleware: Middleware[] = [
    offset(5),
    flip({
      crossAxis: placement.includes('-'),
      fallbackAxisSideDirection: 'end',
      fallbackPlacements: props.fallbackPlacements,
      padding: 5
    }),
    shift({ padding: 5 })
  ]
  if (propMiddleware != null) middleware.push(...propMiddleware)

  const data = useFloating({
    placement,
    open,
    onOpenChange:
      props.onOpenCallback != null
        ? (open) => {
            setOpen(open)
            props.onOpenCallback!(open)
          }
        : setOpen,
    whileElementsMounted: autoUpdate,
    middleware: middleware,
    strategy: 'fixed'
  })
  const click = useClick(data.context, { enabled: ctrOpen == null })
  const dismiss = useDismiss(data.context)
  const interactions = useInteractions([click, dismiss])

  return useMemo(() => ({ open, setOpen, ...interactions, ...data }), [open, setOpen, interactions, data])
}

type ContextType = ReturnType<typeof usePopover>

export const PopoverContext = createContext<ContextType | null>(null)

import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react'
import { cloneElement, createContext, useMemo, useState } from 'react'
import { clsx, getContext } from 'ui/utils'

interface DialogOptions {
  initialOpen?: boolean
  open?: boolean
  setOpen?: (open: boolean) => void
}

// Reference: https://floating-ui.com/docs/dialog

function useDialog({ initialOpen = false, open: ctrOpen, setOpen: ctrSetOpen }: DialogOptions = {}) {
  const [open, setOpen] = ctrOpen != null && ctrSetOpen != null ? [ctrOpen, ctrSetOpen] : useState(initialOpen)
  const data = useFloating({ open, onOpenChange: setOpen })
  const context = data.context
  const click = useClick(context, { enabled: ctrOpen == null })
  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' })
  const interactions = useInteractions([click, dismiss])

  return useMemo(() => ({ open, setOpen, ...interactions, ...data }), [open, setOpen, interactions, data])
}

type ContextType = ReturnType<typeof useDialog>

const DialogContext = createContext<ContextType | null>(null)

export function Dialog({ children, ...options }: { children: React.ReactNode } & DialogOptions) {
  const dialog = useDialog(options)
  return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>
}

interface DialogTriggerProps extends DialogOptions {
  children: React.ReactElement
  asChild?: boolean
  className?: string
}

export function DialogTrigger({ children, asChild = false, ...props }: DialogTriggerProps) {
  const context = getContext(DialogContext)
  const finalProp: Record<string, unknown> = {
    // ref: context.refs.setReference,
    'data-state': context.open ? 'open' : 'closed', // To style trigger based on the state
    ...context.getReferenceProps(props),
    ...props
  }

  finalProp.onClick ??= () => context.setOpen(!context.open)

  if (asChild) return cloneElement(children, finalProp)

  return (
    <button type="button" {...finalProp}>
      {children}
    </button>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
  center?: boolean
}

export function DialogContent({ center, ...props }: DialogContentProps) {
  const { context: floatingContext, ...context } = getContext(DialogContext)

  if (!floatingContext.open) return null

  return (
    <FloatingPortal>
      <FloatingOverlay
        className={clsx('bg-gray-500/25 backdrop-blur-xs', center ? 'flex items-center justify-center' : undefined)}
        lockScroll>
        <FloatingFocusManager context={floatingContext}>
          <div ref={context.refs.setFloating} {...context.getFloatingProps(props)}>
            {props.children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  )
}

export function DialogClose(props: React.ComponentProps<'button'>) {
  const { setOpen } = getContext(DialogContext)
  return <button type="button" onClick={() => setOpen(false)} {...props}></button>
}

import { cloneElement, createContext, useEffect, useRef, useState } from 'react'
import { clsx, getContext } from 'ui/utils'

interface CollapsibleContextType {
  isOpen: boolean
  onClick: React.MouseEventHandler<HTMLDivElement>
  contentRef: React.RefObject<HTMLDivElement | null>
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null)

interface CollapsibleProps {
  children: React.ReactNode
  isOpen?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
  defaultOpen?: boolean
  className?: string
}

export function Collapsible({ defaultOpen = false, children, isOpen, onClick, ...props }: CollapsibleProps) {
  const [_isOpen, _setOpen] = onClick ? [isOpen ?? false, (_: boolean) => undefined] : useState<boolean>(defaultOpen)
  const contentRef = useRef(null)

  function handleOnClick(e: React.MouseEvent<HTMLDivElement>) {
    if (onClick == null) _setOpen(!_isOpen)
    else onClick(e)
  }

  return (
    <CollapsibleContext.Provider value={{ isOpen: _isOpen, onClick: handleOnClick, contentRef }}>
      <div {...props}>{children}</div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps {
  children: React.ReactElement
  asChild?: boolean
  className?: string
}

export function CollapsibleTrigger({ children, asChild, className, ...props }: CollapsibleTriggerProps) {
  const { isOpen, onClick } = getContext(CollapsibleContext)

  const finalProps = {
    onClick: onClick,
    'aria-expanded': isOpen,
    className: clsx('[&[aria-expanded=true]_.collapsible-arrow]:rotate-180', className),
    ...props
  }

  if (asChild) return cloneElement(children, finalProps)

  return <div {...finalProps}>{children}</div>
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

export function CollapsibleContent({ children, ...props }: CollapsibleContentProps) {
  const { isOpen, contentRef } = getContext(CollapsibleContext)

  useEffect(() => {
    if (isOpen) contentRef.current!.style.height = `${contentRef.current?.scrollHeight}px`
  }, [contentRef])

  return (
    <div
      ref={contentRef}
      role="region"
      aria-hidden={!isOpen}
      style={{
        height: isOpen ? `${contentRef.current?.scrollHeight}px` : '0',
        overflow: 'hidden',
        transition: 'height 200ms ease-out'
      }}
      {...props}>
      {children}
    </div>
  )
}

import { clsx, clsxJoin, getContext } from 'ui/utils'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { PopoverContext } from './popover-context'

export const MenuTrigger = PopoverTrigger

export const DropdownMenu = Popover

interface MenuItemProps {
  label: string
  icon?: React.ReactElement
  shortcut?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function MenuItem({ label, shortcut, className, icon, onClick, disabled, ...props }: MenuItemProps) {
  const context = getContext(PopoverContext)

  function __onClose() {
    onClick?.()
    context.setOpen(false)
  }

  return (
    <button
      type="button"
      className={clsxJoin(
        'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none disabled:pointer-events-none disabled:opacity-50',
        !disabled && 'hover:bg-gray-100',
        className
      )}
      disabled={disabled}
      {...props}
      onClick={__onClose}>
      {icon ? (
        <div className="flex items-center gap-2">
          <div>{icon}</div>
          {label}
        </div>
      ) : (
        label
      )}
      {shortcut && <span className="ml-auto text-xs tracking-widest opacity-60">{shortcut}</span>}
    </button>
  )
}

interface MenuContentProps {
  children: React.ReactNode
  className?: string
}

export function MenuContent({ className, ...props }: MenuContentProps) {
  return (
    <PopoverContent
      className={clsx('flex min-w-32 flex-col overflow-hidden border-gray-200 p-1', className)}
      {...props}
    />
  )
}

interface MenuLabelProps {
  className?: string
  children: React.ReactElement | string
}

export function MenuLabel({ className, ...props }: MenuLabelProps) {
  return <label className={clsx('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
}

export function MenuSeparator() {
  return <hr className="-mx-1 my-1 h-px bg-gray-100" />
}

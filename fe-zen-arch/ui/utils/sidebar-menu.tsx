import { Circle } from 'icons/custom/circle'
import { RrAngleSmallDown } from 'icons/rr/fi-rr-angle-small-down'
import { cloneElement } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from 'ui/interactive/collapsible'
import { clsxJoin } from 'ui/utils'

export interface Menu {
  id: string
  name: string
  icon?: React.ReactElement<SVGElement>
}

export interface NestedMenu extends Menu {
  innerMenus?: Menu[]
}

interface SidebarMenuProps {
  name: string
  icon?: React.ReactElement<SVGElement>
  isSelected?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  hasNested?: boolean
  className?: string
}

export function SidebarMenu({ name, icon, className, onClick, isSelected, hasNested }: SidebarMenuProps) {
  return (
    <div
      onClick={onClick}
      className={clsxJoin(
        'flex cursor-default items-center gap-3 rounded-lg p-2 text-sm font-medium text-gray-950 hover:bg-gray-200',
        isSelected && 'rounded-lg border',
        className
      )}>
      {isSelected && <Circle className="size-1 text-gray-800" />}
      {icon && cloneElement(icon, { className: 'size-5 fill-gray-500' })}
      <span className="truncate">{name}</span>
      {hasNested && (
        <>
          <span className="grow" />
          <RrAngleSmallDown className="collapsible-arrow size-4" />
        </>
      )}
    </div>
  )
}

interface NestedSidebarMenuProps {
  name: string
  icon?: React.ReactElement<SVGElement>
  defaultExpanded?: boolean
  children?: Iterable<React.ReactElement>
}

export function NestedSidebarMenu({ name, icon, defaultExpanded, children }: NestedSidebarMenuProps) {
  return (
    <Collapsible defaultOpen={defaultExpanded}>
      <CollapsibleTrigger>
        <SidebarMenu hasNested={true} name={name} icon={icon} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 flex flex-col gap-0.5 p-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}

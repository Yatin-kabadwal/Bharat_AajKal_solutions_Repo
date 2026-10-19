import { createContext, useState } from 'react'
import { clsx, clsxJoin, getContext } from 'ui/utils'

export type TabValue = string | number
export type ValueChangeCallback = React.Dispatch<React.SetStateAction<TabValue>>

interface TabsContextData {
  activeTab: TabValue
  handleChange: (value: TabValue) => void
}

const TabsContext = createContext<TabsContextData | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: TabValue
  onValueChange?: ValueChangeCallback
  defaultValue?: TabValue
  children: React.ReactNode
}

export function Tabs({ children, value, defaultValue, onValueChange, ...props }: TabsProps) {
  if (import.meta.env.DEV) {
    if (!(value && onValueChange) && defaultValue == null) {
      throw new Error(
        'Default value must be passed when using as uncontrolled component, otherwise no tab would be opened on initial load'
      )
    }
  }

  const [activeTab, setActiveTab] = value && onValueChange ? [value, onValueChange] : useState<TabValue>(defaultValue!)

  function handleChange(value: TabValue) {
    setActiveTab(value)
    if (onValueChange) onValueChange(value)
  }

  return (
    <TabsContext.Provider value={{ activeTab, handleChange }}>
      <div {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={clsx('inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500', className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabValue
  children: React.ReactNode
}

const tabsTriggerClass = clsxJoin(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-gray-10 transition-all',
  'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50'
)

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeTab, handleChange } = getContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      className={clsxJoin(tabsTriggerClass, isActive && 'foreground text-gray-950 shadow-sm', className)}
      onClick={() => handleChange(value)}>
      {children}
    </button>
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabValue
  children: React.ReactNode
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = getContext(TabsContext)

  return (
    <div
      role="tabpanel"
      hidden={activeTab !== value}
      className={clsx(
        'ring-offset-gray-10 mt-2 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 focus-visible:outline-hidden',
        className
      )}>
      {activeTab === value && children}
    </div>
  )
}

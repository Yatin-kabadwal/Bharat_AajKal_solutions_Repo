interface ScrollAreaProps {
  children: React.ReactNode
  outerClass?: string
  innerClass?: string
  ref: React.Ref<HTMLDivElement>
}

export function ScrollArea({ children, outerClass = '', innerClass = '', ref }: ScrollAreaProps) {
  return (
    <div className={`relative w-full overflow-hidden ${outerClass}`} ref={ref}>
      <div className={`size-full overflow-auto ${innerClass}`}>{children}</div>
    </div>
  )
}

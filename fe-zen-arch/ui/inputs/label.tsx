import { clsx } from 'ui/utils'

interface Label {
  className?: string
  htmlFor?: string
  children: React.ReactNode
}

export function Label({ className, ...props }: Label) {
  return (
    <label
      className={clsx(
        'text-sm leading-none font-light peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
}

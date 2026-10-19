import { clsx } from 'ui/utils'

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={clsx('animate-pulse rounded-md bg-gray-900/20', className)} {...props} />
}

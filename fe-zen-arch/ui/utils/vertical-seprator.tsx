import { clsx } from 'ui/utils'

export function VerticalSeparator({ className }: { className?: string }) {
  return <hr className={clsx('float-left w-[2px] bg-gray-200', className)}></hr>
}

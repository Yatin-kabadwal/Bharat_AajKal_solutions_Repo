import { clsx } from 'ui/utils'

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={clsx('table w-full caption-bottom text-sm', className)} {...props} />
    </div>
  )
}

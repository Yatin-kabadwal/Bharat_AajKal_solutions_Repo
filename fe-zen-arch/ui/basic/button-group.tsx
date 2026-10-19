import { clsx, clsxJoin } from 'ui/utils'

export function ButtonGroup({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={clsx('inline-flex rounded-md shadow-xs', className)} role="group" {...props}>
      {children}
    </div>
  )
}

interface BtnGroupSingle extends React.ComponentProps<'button'> {
  first?: boolean
  last?: boolean
  selected?: boolean
}

export function BtnGroupSingle({ first, last, children, selected, className, ...props }: BtnGroupSingle) {
  return (
    <button
      {...props}
      type="button"
      className={clsxJoin(
        'inline-flex items-center border px-4 py-2 hover:bg-gray-200',
        last && 'rounded-e-lg border',
        first && 'rounded-s-lg border',
        first == null && last == null && !selected && 'border-y border-l',
        selected && 'border-primary-600 z-10 border-2 bg-gray-100',
        className
      )}>
      {children}
    </button>
  )
}

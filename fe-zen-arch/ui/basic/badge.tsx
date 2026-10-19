import { cva, type VariantProps } from 'ui/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 hover:bg-primary-800 border-transparent text-gray-50 shadow-sm',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80',
        destructive: 'border-transparent bg-red-600 text-gray-50 shadow-sm hover:bg-red-500/80',
        success: 'border-transparent bg-green-700 text-gray-50',
        warning: 'border-transparent bg-yellow-100 text-yellow-800',
        outline: 'text-gray-950'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  className?: string
  children: React.ReactNode
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={badgeVariants({ variant, className })} {...props} />
}

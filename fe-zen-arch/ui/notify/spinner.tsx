import { cva } from 'ui/utils'

const spinnerVariants = cva('border-primary-800 animate-spin rounded-full border-4 border-t-transparent', {
  variants: {
    size: {
      default: 'size-8',
      sm: 'size-5',
      lg: 'size-14'
    }
  },
  defaultVariants: {
    size: 'default'
  }
})
interface SpinnerProps {
  size?: 'sm' | 'lg'
  className?: string
}

export function Spinner({ className, size }: SpinnerProps) {
  return <div className={spinnerVariants({ size, className })} />
}

export function SpinnerScreen() {
  return (
    <div className="flex items-center justify-center" style={{ marginTop: '15rem' }}>
      <Spinner size="lg" />
    </div>
  )
}

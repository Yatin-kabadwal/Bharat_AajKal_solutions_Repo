import { Spinner } from 'ui/notify/spinner'
import { buttonVariants } from './button-style'

export interface ButtonProps {
  children?: React.ReactNode
  title?: string
  type?: 'submit' | 'reset' | 'button' | undefined
  disabled?: boolean | undefined
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  loading?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

export function Button({ className, variant, size, loading, title, children, type, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      // Important to add default type as button, otherwise non-submit button inside forms would cause bugs
      type={type ?? 'button'}
      disabled={loading}
      {...props}>
      {loading ? <Spinner size="sm" /> : (title ?? children)}
    </button>
  )
}

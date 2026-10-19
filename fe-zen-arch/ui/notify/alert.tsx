import { RrBell } from 'icons/rr/fi-rr-bell'
import { RrCheckCircle } from 'icons/rr/fi-rr-check-circle'
import { RrExclamation } from 'icons/rr/fi-rr-exclamation'
import { cva, VariantProps } from 'ui/utils'

const alertVariants = cva('flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left', {
  variants: {
    variant: {
      default: 'foreground border-gray-200 text-gray-950',
      destructive: 'foreground border-red-600 text-red-600',
      success: 'foreground border-green-600 text-green-600'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

type AlertProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & CustomPrams
interface CustomPrams {
  icon: React.ReactNode
}

export function Alert({ className, variant, children, icon, ...props }: AlertProps) {
  return (
    <div role="alert" className={alertVariants({ variant, className })} {...props}>
      <div className="shrink-0">{icon}</div>
      <div>{children}</div>
    </div>
  )
}

const alertTitleClass = 'font-medium leading-none tracking-tight'

const alertDescClass = 'text-sm leading-relaxed'

interface DefaultAlertProps {
  title: string
  description?: string
  className?: string
}

export function AlertDefault({ title, description, className }: DefaultAlertProps) {
  return (
    <Alert className={className} icon={<RrBell className="size-4" />}>
      <h5 className={alertTitleClass}>{title}</h5>
      {description && <div className={alertDescClass}>{description}</div>}
    </Alert>
  )
}

export function AlertDanger({ title, description, className }: DefaultAlertProps) {
  return (
    <Alert variant="destructive" className={className} icon={<RrExclamation className="size-4" />}>
      <h5 className={alertTitleClass}>{title}</h5>
      {description && <div className={alertDescClass}>{description}</div>}
    </Alert>
  )
}

export function AlertSuccess({ title, description, className }: DefaultAlertProps) {
  return (
    <Alert variant="success" className={className} icon={<RrCheckCircle className="size-4" />}>
      <h5 className={alertTitleClass}>{title}</h5>
      {description && <div className={alertDescClass}>{description}</div>}
    </Alert>
  )
}

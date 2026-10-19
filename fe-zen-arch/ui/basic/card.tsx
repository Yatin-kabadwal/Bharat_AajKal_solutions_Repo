import { clsx } from 'ui/utils'

interface CardProp {
  title: string
  description?: string
  // CSS classes for additional section & body styling with tailwind
  sectionClass?: string
  bodyClass?: string
  children: React.ReactNode
}

export function SectionCard({ title, description, sectionClass, bodyClass, children }: CardProp) {
  return (
    <section className={clsx('foreground shadow-card mb-5 w-full rounded-md', sectionClass)}>
      <div className="border-b border-gray-300 p-4">
        <h5 className="text-sm font-semibold text-gray-950 uppercase">{title}</h5>
        {description && <p className={cardDescriptionClass}>{description}</p>}
      </div>

      <div className={clsx('p-4', bodyClass)}>{children}</div>
    </section>
  )
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('foreground rounded-xl border border-gray-200 text-gray-950 shadow-sm', className)}
      {...props}
    />
  )
}

interface CardHeaderProps {
  title?: string
  description?: string
  className?: string
  children?: React.ReactNode
}

const cardTitleClass = 'font-semibold leading-none tracking-tight'
const cardDescriptionClass = 'text-sm text-gray-500'

export function CardHeader({ title, className, description, children }: CardHeaderProps) {
  return (
    <div className={clsx('flex flex-col gap-y-1.5 p-6', className)}>
      {title && <div className={cardTitleClass}>{title}</div>}
      {description && <div className={cardDescriptionClass}>{description}</div>}
      {children}
    </div>
  )
}

interface CardComponentProps {
  className?: string
  children?: React.ReactNode
}

export function CardTitle(props: CardComponentProps) {
  return <div className={cardTitleClass} {...props} />
}

export function CardDescription(props: CardComponentProps) {
  return <div className={cardDescriptionClass} {...props} />
}

interface CardInnerProps {
  className?: string
  children?: React.ReactNode
}

export function CardContent({ className, ...props }: CardInnerProps) {
  return <div className={clsx('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardInnerProps) {
  return <div className={clsx('flex items-center p-6 pt-0', className)} {...props} />
}

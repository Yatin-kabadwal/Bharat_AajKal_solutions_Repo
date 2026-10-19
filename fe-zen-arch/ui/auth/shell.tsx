import { Card } from 'ui/basic/card'
import { DarkModeToggleFloating } from 'ui/basic/dark-mode'
import { clsx } from 'ui/utils'

interface _ShellProps {
  children: React.ReactNode
  className?: string
}

const appName = import.meta.env.APP_NAME

export function Shell({ children, className }: _ShellProps) {
  return (
    <section className="mx-auto flex h-screen max-w-md flex-col items-center justify-center">
      <div className="mb-6 flex items-center">
        <span className="text-2xl font-semibold text-gray-900">{appName}</span>
      </div>
      <Card className={clsx('max-w-xl p-7 text-center', className)}>{children}</Card>
      <DarkModeToggleFloating />
    </section>
  )
}

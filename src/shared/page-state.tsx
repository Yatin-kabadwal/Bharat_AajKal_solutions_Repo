import { Button } from 'ui/basic/button'
import { Spinner } from 'ui/notify/spinner'

// The three non-happy states every data-driven page needs, in one place so they look the same.

export function LoadingBlock({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-sm text-gray-500">
      <Spinner size="lg" />
      {label}
    </div>
  )
}

export function ErrorBlock({ title, onRetry }: { title: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 p-10 text-center">
      <p className="font-medium text-red-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
      {onRetry && (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyBlock({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

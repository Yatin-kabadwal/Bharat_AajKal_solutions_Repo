import { ErrorIllustration } from 'icons/custom/error-illustration'
import { Button } from 'ui/basic/button'

interface Props {
  message: string
  description?: string
  actions?: React.ReactElement
}

export function StatusPage({ message, description, actions }: Props) {
  return (
    <div className="flex items-center justify-center">
      <div className="container flex flex-col items-center p-4 text-center">
        <div className="relative mb-8">
          <ErrorIllustration className="h-auto w-96" />
          <div className="absolute -bottom-4 h-16 w-full" />
        </div>

        <h1 className="mb-4 text-3xl font-medium text-gray-900">{message}</h1>

        {description && <p className="mb-8 max-w-lg text-gray-600">{description}</p>}

        {actions && actions}
      </div>
    </div>
  )
}

export function ErrorPage({
  message = 'Unexpected Error Occurred',
  description = 'Please try again after sometime, we are looking into it.'
}) {
  return (
    <StatusPage
      message={message}
      description={description}
      actions={
        <div className="flex gap-4">
          <Button variant="default" size="lg" onClick={() => window.history.go(-1)}>
            Go Back
          </Button>

          <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      }
    />
  )
}

import * as Sentry from '@sentry/browser'
import { Component, ErrorInfo, ReactNode } from 'react'
import { ErrorPage } from 'ui/notify/status-page'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | undefined
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: undefined }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentStack } = errorInfo

    try {
      Sentry.captureException(error, {
        captureContext: {
          tags: { errorBoundary: true },
          contexts: { react: { componentStack } }
        }
      })
    } catch {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render(): ReactNode {
    // During development show actual error message
    if (import.meta.env.DEV) {
      if (this.state.hasError) {
        return (
          <ErrorPage
            message={this.state.error?.message ?? 'Unexpected Error'}
            description={'Check console for complete details'}
          />
        )
      }
    }

    if (this.state.hasError) return <ErrorPage />

    return this.props.children
  }
}

if (import.meta.env.DEV) {
  const { scan } = await import('react-scan')
  if (localStorage.getItem('react-scan') != null) scan({ enabled: true })
}

import { ErrorBoundary } from 'core/observability/error-boundary'
import { initErrorTracking } from 'core/observability/error-tracking'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

window.version = import.meta.env.PUBLIC_RELEASE_VERSION

void initErrorTracking({
  release: import.meta.env.PUBLIC_RELEASE_VERSION,
  dsn: import.meta.env.PUBLIC_SENTRY_DSN
})

let rendered = false

export function init(App: React.ReactNode) {
  if (rendered) return
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>{App}</ErrorBoundary>
    </StrictMode>
  )
  rendered = true
}

import * as Sentry from '@sentry/browser'
import { toast } from 'core/toast-manager'
import { wait } from 'core/utils'

interface SentryParams {
  dsn: string
  release: string
  beforeSend?: (event: Sentry.ErrorEvent, hint: Sentry.EventHint) => Sentry.ErrorEvent | null
}

export async function initErrorTracking(params: SentryParams) {
  // initialize after some delay
  await wait(750)

  Sentry.init({
    dsn: params.dsn,
    release: params.release,
    environment: 'prod',
    beforeSend: import.meta.env.DEV
      ? (event, _) => {
          showError(event.exception?.values?.[0].value ?? 'Unexpected Error')
          return null
        }
      : params.beforeSend,
    skipBrowserExtensionCheck: true,
    // don't capture any replay session, traces
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    tracesSampleRate: 0,
    // filter some integrations from defaults
    integrations: (integrations) => {
      return integrations.filter((integration) => {
        return integration.name != 'BrowserSession'
      })
    }
  })

  // Show error toast, whenever any error is logged in console during development,
  // to quickly spot any errors during development
  if (import.meta.env.DEV) {
    // Store the original console methods
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    // Override console.error
    console.error = function (...args) {
      originalConsoleError.apply(console, args)
      showError(`Error: ${getMessage(...args)}`)
    }

    // Override console.warn to show toast alerts for warnings during development
    console.warn = function (...args) {
      originalConsoleWarn.apply(console, args)
      showError(`Warning: ${getMessage(...args)}`)
    }

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => showError(`Unhandled Promise Rejection: ${event.reason}`))

    // Catch global errors
    window.addEventListener('error', (event) =>
      showError(`Runtime Error: ${event.message}\nAt: ${event.filename}:${event.lineno}`)
    )
  }
}

function showError(message: string) {
  // Show error message after react has finished rendering
  setTimeout(() => toast.error(message), 500)
}

function getMessage(...args: any[]) {
  return args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ')
}

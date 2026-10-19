import { toast } from './toast-manager'

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

export interface ErrorMessage {
  message: string
  description?: string
}

export class InternalError extends Error {
  status: number
  description: string | undefined

  constructor(message: string, status: number, description?: string) {
    super(message)
    this.status = status
    this.description = description
  }
}

export function parseError(error: any): ErrorMessage {
  try {
    const obj = JSON.parse(error)
    if (typeof obj == 'object') return { message: obj.message, description: obj.description }
    return { message: obj }
  } catch {
    return { message: `${error}` }
  }
}

export function handleError(error: unknown) {
  const msg = describeError(error)
  toast.error(msg.message, { description: msg.description })
}

export function describeError(error: unknown): ErrorMessage {
  if (error instanceof InternalError) {
    return { message: capitalize(error.message), description: error.description ?? `Code: ${error.status}` }
  }

  console.error('Unexpected Error', error)
  return { message: 'Sorry! Unexpected error occurred', description: ' Please try again later.' }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const defaultDebounceTime = 500

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number = defaultDebounceTime) {
  let timeout: ReturnType<typeof setTimeout>
  function debounced(...args: Parameters<T>) {
    clearTimeout(timeout)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    timeout = setTimeout(() => func(...args), wait)
  }
  debounced.cancel = () => clearTimeout(timeout)
  return debounced
}

export function wait(ms: number) {
  return new Promise((resolve, _) => setTimeout(() => resolve(undefined), ms))
}

// RFC 5322 compliant regex pattern for email validation
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function validEmail(email: string) {
  if (!email || typeof email !== 'string') return false

  // Check length constraints
  if (email.length > 254) return false

  // Check if local part exceeds 64 characters
  const localPart = email.split('@')[0]
  if (localPart && localPart.length > 64) return false

  return emailRegex.test(email)
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function shortId(length = 8) {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

import { InternalError, wait } from './utils'

// Total retries made in case of error will be maxRetries + 1
const maxRetries = 2
// For default exponential backoff in withRetry
const baseDelayMs = 2000

export function shouldRetry(failureCount: number, error: any) {
  if (error.name === 'AbortError') return false
  // Don't retry if it's client error (40x errors)
  if (error instanceof InternalError && error.status < 500) return false
  return failureCount < maxRetries
}

export async function withRetry<T, P extends any[]>(fn: (...args: P) => T | Promise<T>, ...params: P): Promise<T> {
  let failureCount = 0

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    try {
      return await fn(...params)
    } catch (error) {
      if (!shouldRetry(failureCount, error)) throw error

      // Add exponential backoff time
      const delay = baseDelayMs * Math.pow(2, failureCount - 1) * (0.5 + Math.random() * 0.5)
      await wait(delay)

      failureCount++
    }
  }
}

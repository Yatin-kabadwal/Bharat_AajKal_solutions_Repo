import { InternalError } from 'core/utils'

// Simulates the network for the mock API: latency, and failures you can trigger on demand.
//
//   ?mock-latency=1500        slow every call down (ms)
//   ?mock-fail=options        fail one call group; comma separated. Groups:
//                             options | parties | ports | bills | submit | download
//   ?mock-fail=all            fail everything
//   ?mock-empty=bills         make the shipping bill list come back empty
//
// The flags are read on every call, so they can be changed in the address bar and applied by
// reloading. They are ignored in production builds.

export type FailureGroup = 'options' | 'parties' | 'ports' | 'bills' | 'submit' | 'download'

const DEFAULT_LATENCY_MS = 250

function searchParams(): URLSearchParams {
  return new URLSearchParams(import.meta.env.DEV ? window.location.search : '')
}

function latency(): number {
  const requested = Number(searchParams().get('mock-latency'))
  return Number.isFinite(requested) && requested > 0 ? requested : DEFAULT_LATENCY_MS
}

function shouldFail(group: FailureGroup): boolean {
  const flags = (searchParams().get('mock-fail') ?? '').split(',')
  return flags.includes('all') || flags.includes(group)
}

/** Should this collection come back empty, to exercise the empty state? */
export function isEmptyForced(collection: 'bills'): boolean {
  return (searchParams().get('mock-empty') ?? '').split(',').includes(collection)
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

/**
 * Runs `handler` as if it were a network call: waits, optionally fails with a 503, and returns a
 * deep copy so callers can never mutate the mock database by accident (like a real JSON response).
 */
export async function respond<T>(group: FailureGroup, handler: () => T): Promise<T> {
  await wait(latency())
  if (shouldFail(group)) throw new InternalError('Service unavailable', 503, 'The mock server was told to fail.')
  return structuredClone(handler())
}

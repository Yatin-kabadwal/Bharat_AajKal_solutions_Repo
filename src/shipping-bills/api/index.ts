import type { ShippingBillApi } from './contract'
import { createHttpShippingBillApi } from './http/http-api'
import { mockShippingBillApi } from './mock/mock-api'

// Composition root for the data layer: the one place that decides which implementation the app uses.
// Set `PUBLIC_API_MODE=http` (and `PUBLIC_API_URL`) in `.env` to talk to a real backend. No component,
// hook or form code changes: they only know the `ShippingBillApi` interface.
export const shippingBillApi: ShippingBillApi =
  import.meta.env.PUBLIC_API_MODE === 'http'
    ? createHttpShippingBillApi(import.meta.env.PUBLIC_API_URL)
    : mockShippingBillApi

export { SubmissionRejectedError } from './contract'
export type {
  BranchInput,
  BusinessInput,
  ExporterInput,
  FlatFile,
  PortKind,
  ShippingBillApi,
  SubmitResult
} from './contract'

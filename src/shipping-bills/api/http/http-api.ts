import { get, post, put } from 'core/request'
import { InternalError } from 'core/utils'
import { toShippingBillPayload } from '../../domain/payload'
import type {
  BillSummary,
  Branch,
  Business,
  Exporter,
  FieldErrors,
  FormOptions,
  Option,
  PortOption,
  SavedBill
} from '../../domain/types'
import { type FlatFile, type ShippingBillApi, type SubmitResult, SubmissionRejectedError } from '../contract'

// The real thing: `ShippingBillApi` over HTTP, using fe-zen-arch's request helpers (which add auth
// interceptors, timeouts and turn failures into `InternalError`).
//
// Endpoints this adapter expects (all JSON):
//
//   GET  /form-options                          -> FormOptions
//   GET  /ports?kind=loading|destination&q=     -> PortOption[]       GET /ports/:code -> PortOption
//   GET  /document-types?q=                     -> Option[]
//   GET  /exporters?q=                          -> Exporter[]         GET /exporters/:id -> Exporter
//   GET  /businesses?role=&q=                   -> Business[]         GET /businesses/:id -> Business
//   GET  /exporters/:id/marks-and-numbers       -> Option[]
//   GET  /exporters/:id/branches?q=             -> Branch[]           (same under /businesses/:id)
//   POST /exporters, PUT /exporters/:id         -> Exporter           (same for /businesses)
//   POST /exporters/:id/branches, PUT /exporters/:id/branches/:branchId -> Branch
//   GET  /shipping-bills                        -> BillSummary[]
//   GET  /shipping-bills/:id                    -> SavedBill          (404 when it does not exist)
//   POST /shipping-bills, PUT /shipping-bills/:id        { values }   -> SavedBill       (draft)
//   POST /shipping-bills/submit, PUT /shipping-bills/:id/submit
//                                               { values, payload }   -> SubmitResult
//   GET  /shipping-bills/:id/flat-file          -> FlatFile
//
// Rejected submissions: HTTP 422 with `{ "message": "...", "description": "<JSON of {path: message}>" }`.
// (`core/request` keeps only message / description from an error body, so the field errors travel
// in `description`.) Any other failure is thrown as the `InternalError` it already is.

type PartyKind = 'exporters' | 'businesses'

/** 404 means "no such record" for reads: the interface says `undefined`, not an exception. */
async function getOrUndefined<T>(url: string): Promise<T | undefined> {
  try {
    return await get<T>(url)
  } catch (error) {
    if (error instanceof InternalError && error.status === 404) return undefined
    throw error
  }
}

function parseFieldErrors(error: InternalError): FieldErrors {
  try {
    const parsed: unknown = JSON.parse(error.description ?? '')
    if (parsed != null && typeof parsed === 'object') return parsed as FieldErrors
  } catch {
    // Fall through: a 422 without a usable body still has to say something.
  }
  return { _: error.message }
}

export function createHttpShippingBillApi(baseUrl: string): ShippingBillApi {
  function url(path: string) {
    return `${baseUrl}${path}`
  }
  function owner(kind: 'exporter' | 'business'): PartyKind {
    return kind === 'exporter' ? 'exporters' : 'businesses'
  }

  return {
    getFormOptions: () => get<FormOptions>(url('/form-options')),
    searchPorts: (kind, q) => get<PortOption[]>(url('/ports'), { query: { kind, q } }),
    getPort: (code) => getOrUndefined<PortOption>(url(`/ports/${encodeURIComponent(code)}`)),
    searchDocumentTypes: (q) => get<Option[]>(url('/document-types'), { query: { q } }),
    getMarksAndNumbers: (exporterId) =>
      get<Option[]>(url(`/exporters/${encodeURIComponent(exporterId)}/marks-and-numbers`)),

    searchExporters: (q) => get<Exporter[]>(url('/exporters'), { query: { q } }),
    searchBusinesses: (role, q) => get<Business[]>(url('/businesses'), { query: { role, q } }),
    getExporter: (id) => getOrUndefined<Exporter>(url(`/exporters/${encodeURIComponent(id)}`)),
    getBusiness: (id) => getOrUndefined<Business>(url(`/businesses/${encodeURIComponent(id)}`)),
    searchBranches: (kind, ownerId, q) =>
      get<Branch[]>(url(`/${owner(kind)}/${encodeURIComponent(ownerId)}/branches`), { query: { q } }),

    saveExporter: (input) =>
      input.id == null ? post<Exporter>(url('/exporters'), input) : put<Exporter>(url(`/exporters/${input.id}`), input),
    saveBusiness: (input) =>
      input.id == null
        ? post<Business>(url('/businesses'), input)
        : put<Business>(url(`/businesses/${input.id}`), input),
    saveBranch: (kind, ownerId, input) => {
      const base = url(`/${owner(kind)}/${ownerId}/branches`)
      return input.id == null ? post<Branch>(base, input) : put<Branch>(`${base}/${input.id}`, input)
    },

    listBills: () => get<BillSummary[]>(url('/shipping-bills')),
    getBill: (id) => getOrUndefined<SavedBill>(url(`/shipping-bills/${id}`)),
    saveDraft: (values, id) =>
      id == null
        ? post<SavedBill>(url('/shipping-bills'), { values })
        : put<SavedBill>(url(`/shipping-bills/${id}`), { values }),

    async submitBill(values, id): Promise<SubmitResult> {
      const body = { values, payload: toShippingBillPayload(values) }
      try {
        return id == null
          ? await post<SubmitResult>(url('/shipping-bills/submit'), body)
          : await put<SubmitResult>(url(`/shipping-bills/${id}/submit`), body)
      } catch (error) {
        if (error instanceof InternalError && error.status === 422) {
          throw new SubmissionRejectedError(parseFieldErrors(error))
        }
        throw error
      }
    },

    getFlatFile: (id) => get<FlatFile>(url(`/shipping-bills/${id}/flat-file`))
  }
}

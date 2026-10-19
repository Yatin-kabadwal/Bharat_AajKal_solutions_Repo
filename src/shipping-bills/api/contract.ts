import type {
  BillSummary,
  Branch,
  Business,
  BusinessRole,
  Exporter,
  FieldErrors,
  FormOptions,
  Option,
  PartyKind,
  PortOption,
  SavedBill,
  ShippingBillFormValues
} from '../domain/types'

// The contract between the UI and "the backend".
//
// The UI only ever talks to a `ShippingBillApi`. Today `api/index.ts` hands it the mock
// implementation; a real one would implement the same interface with `fetch`/`core/request`.
// Everything here is async and returns plain JSON-serializable data.

export interface BranchInput extends Omit<Branch, 'id'> {
  id?: number
}

export interface ExporterInput extends Omit<Exporter, 'id' | 'branches'> {
  id?: number
  /** Required when creating a party: every party needs one address. */
  firstBranch?: Omit<Branch, 'id'>
}

export interface BusinessInput extends Omit<Business, 'id' | 'branches'> {
  id?: number
  firstBranch?: Omit<Branch, 'id'>
}

export interface SubmitResult {
  bill: SavedBill
  /** Reference the customs filing step will use. */
  referenceNumber: string
}

export interface FlatFile {
  filename: string
  content: string
}

export type PortKind = 'loading' | 'destination'

export interface ShippingBillApi {
  // Reference data
  getFormOptions(): Promise<FormOptions>
  searchPorts(kind: PortKind, query: string): Promise<PortOption[]>
  getPort(code: string): Promise<PortOption | undefined>
  searchDocumentTypes(query: string): Promise<Option[]>
  getMarksAndNumbers(exporterId: string): Promise<Option[]>

  // Parties
  searchExporters(query: string): Promise<Exporter[]>
  searchBusinesses(role: BusinessRole, query: string): Promise<Business[]>
  getExporter(id: string): Promise<Exporter | undefined>
  getBusiness(id: string): Promise<Business | undefined>
  searchBranches(kind: PartyKind, ownerId: string, query: string): Promise<Branch[]>
  saveExporter(input: ExporterInput): Promise<Exporter>
  saveBusiness(input: BusinessInput): Promise<Business>
  saveBranch(kind: PartyKind, ownerId: number, input: BranchInput): Promise<Branch>

  // Shipping bills
  listBills(): Promise<BillSummary[]>
  getBill(id: number): Promise<SavedBill | undefined>
  /** Stores work in progress. No validation: a draft may be incomplete. */
  saveDraft(values: ShippingBillFormValues, id?: number): Promise<SavedBill>
  /** Validates and files the bill. Rejects with `SubmissionRejectedError` when the data is invalid. */
  submitBill(values: ShippingBillFormValues, id?: number): Promise<SubmitResult>
  getFlatFile(id: number): Promise<FlatFile>
}

/**
 * Thrown by `submitBill` when the server rejects the data (HTTP 422 in a real backend).
 * `fieldErrors` is keyed by field path, ready to be applied to the form.
 */
export class SubmissionRejectedError extends Error {
  readonly fieldErrors: FieldErrors

  constructor(fieldErrors: FieldErrors) {
    super('The shipping bill has errors')
    this.name = 'SubmissionRejectedError'
    this.fieldErrors = fieldErrors
  }
}

import { InternalError } from 'core/utils'
import { invoiceTotal } from '../../domain/calculations'
import { generateFlatFile } from '../../domain/flat-file'
import { isIndianPort } from '../../domain/ports'
import type {
  BillSummary,
  Branch,
  Business,
  BusinessRole,
  Exporter,
  FieldErrors,
  PartyKind,
  SavedBill,
  ShippingBillFormValues
} from '../../domain/types'
import { validateBill } from '../../domain/validation'
import { ShippingBillApi, SubmissionRejectedError } from '../contract'
import { database, nextId, persist } from './db'
import { marksByExporter } from './fixtures/marks-and-numbers'
import { documentTypes, formOptions } from './fixtures/options'
import { seedPorts } from './fixtures/ports'
import { isEmptyForced, respond } from './network'

// A stand-in for the real backend. Every method is async and goes through `respond()`, so callers
// see latency, copies of the data (never the stored objects) and the failures `network.ts` can
// inject. Server-side rules (reference integrity, uniqueness) live here, like they would on a server.

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase()
  return fields.some((field) => field?.toLowerCase().includes(q))
}

function notFound(what: string): InternalError {
  return new InternalError(`${what} not found`, 404)
}

function findOwner(kind: PartyKind, id: string): Exporter | Business | undefined {
  const db = database()
  const parties: (Exporter | Business)[] = kind === 'exporter' ? db.exporters : db.businesses
  return parties.find((party) => String(party.id) === id)
}

function summarize(bill: SavedBill): BillSummary {
  const db = database()
  const { values } = bill
  const totals = new Map<string, number>()
  values.invoices.forEach((invoice) => {
    totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + invoiceTotal(invoice))
  })

  return {
    id: bill.id,
    status: bill.status,
    jobNumber: values.jobNumber,
    jobDate: values.jobDate,
    exporterName: db.exporters.find((exporter) => String(exporter.id) === values.exporterId)?.name ?? '',
    consigneeName: db.businesses.find((business) => String(business.id) === values.consigneeId)?.name ?? '',
    loadingPort: values.loadingPort,
    finalDestinationPort: values.finalDestinationPort,
    invoiceNumbers: values.invoices.map((invoice) => invoice.invoiceNumber),
    totals: [...totals].map(([currency, amount]) => ({ currency, amount })),
    updated: bill.updated
  }
}

/** Rules only the server can check: do the referenced records exist, is the invoice number taken? */
function serverRules(values: ShippingBillFormValues, billId: number | undefined): FieldErrors {
  const errors: FieldErrors = {}
  const db = database()

  function checkParty(kind: PartyKind, ownerPath: string, branchPath: string, ownerId: string, branchId: string) {
    const owner = findOwner(kind, ownerId)
    if (!owner) {
      errors[ownerPath] = `Unknown ${kind === 'exporter' ? 'exporter' : 'business'}`
    } else if (!owner.branches.some((branch) => String(branch.id) === branchId)) {
      errors[branchPath] = `This branch does not belong to ${owner.name}`
    }
  }

  checkParty('exporter', 'exporterId', 'exporterBranchId', values.exporterId, values.exporterBranchId)
  checkParty('business', 'consigneeId', 'consigneeBranchId', values.consigneeId, values.consigneeBranchId)

  if (!seedPorts.some((port) => port.code === values.loadingPort)) errors.loadingPort = 'Unknown port'
  if (!seedPorts.some((port) => port.code === values.finalDestinationPort)) errors.finalDestinationPort = 'Unknown port'

  values.invoices.forEach((invoice, index) => {
    if (!invoice.buyerSameAsConsignee) {
      checkParty(
        'business',
        `invoices.${index}.buyerId`,
        `invoices.${index}.buyerBranchId`,
        invoice.buyerId,
        invoice.buyerBranchId
      )
    }

    const taken = db.bills.find(
      (bill) =>
        bill.id !== billId &&
        bill.values.invoices.some((other) => other.invoiceNumber.toLowerCase() === invoice.invoiceNumber.toLowerCase())
    )
    if (taken) errors[`invoices.${index}.invoiceNumber`] = `Already used on shipping bill #${taken.id}`
  })

  return errors
}

function store(values: ShippingBillFormValues, id: number | undefined, status: 'draft' | 'submitted'): SavedBill {
  const db = database()
  const existing = id == null ? undefined : db.bills.find((bill) => bill.id === id)
  if (id != null && !existing) throw notFound('Shipping bill')

  const now = new Date().toISOString()
  const bill: SavedBill = {
    id: existing?.id ?? nextId(),
    // Saving more work on an already filed bill does not turn it back into a draft.
    status: existing?.status === 'submitted' ? 'submitted' : status,
    created: existing?.created ?? now,
    updated: now,
    values: structuredClone(values)
  }
  db.bills = [bill, ...db.bills.filter((other) => other.id !== bill.id)]
  persist()
  return bill
}

function upsertBranch(owner: Exporter | Business, branch: Branch) {
  owner.branches = [...owner.branches.filter((item) => item.id !== branch.id), branch]
}

export const mockShippingBillApi: ShippingBillApi = {
  // ---- Reference data ------------------------------------------------------

  getFormOptions() {
    return respond('options', () => formOptions)
  },

  searchPorts(kind, query) {
    return respond('ports', () =>
      seedPorts
        // Bills are exported *from* India, so loading ports are Indian and destinations are not.
        .filter((port) => (kind === 'loading') === isIndianPort(port.code))
        .filter((port) => matches(query, port.name, port.code))
    )
  },

  getPort(code) {
    return respond('ports', () => seedPorts.find((port) => port.code === code))
  },

  searchDocumentTypes(query) {
    return respond('options', () => documentTypes.filter((type) => matches(query, type.label, String(type.value))))
  },

  getMarksAndNumbers(exporterId) {
    return respond('options', () => marksByExporter[exporterId] ?? [])
  },

  // ---- Parties -------------------------------------------------------------

  searchExporters(query) {
    return respond('parties', () =>
      database().exporters.filter((exporter) => !exporter.disabled && matches(query, exporter.name, exporter.iec))
    )
  },

  searchBusinesses(role: BusinessRole, query) {
    const flag = { consignee: 'isConsignee', buyer: 'isBuyer', thirdParty: 'isThirdParty' } as const
    return respond('parties', () =>
      database().businesses.filter((business) => business[flag[role]] && matches(query, business.name))
    )
  },

  getExporter(id) {
    return respond('parties', () => database().exporters.find((exporter) => String(exporter.id) === id))
  },

  getBusiness(id) {
    return respond('parties', () => database().businesses.find((business) => String(business.id) === id))
  },

  searchBranches(kind, ownerId, query) {
    return respond('parties', () =>
      (findOwner(kind, ownerId)?.branches ?? []).filter((branch) => matches(query, branch.branchName, branch.city))
    )
  },

  saveExporter(input) {
    return respond('parties', () => {
      const db = database()
      const id = input.id ?? nextId()
      const previous = db.exporters.find((exporter) => exporter.id === id)
      const { firstBranch, ...fields } = input
      const exporter: Exporter = {
        ...fields,
        id,
        disabled: input.disabled ?? previous?.disabled,
        branches: previous?.branches ?? (firstBranch ? [{ ...firstBranch, id: id + 1 }] : [])
      }
      db.exporters = [...db.exporters.filter((item) => item.id !== id), exporter]
      persist()
      return exporter
    })
  },

  saveBusiness(input) {
    return respond('parties', () => {
      const db = database()
      const id = input.id ?? nextId()
      const previous = db.businesses.find((business) => business.id === id)
      const { firstBranch, ...fields } = input
      const business: Business = {
        ...fields,
        id,
        branches: previous?.branches ?? (firstBranch ? [{ ...firstBranch, id: id + 1 }] : [])
      }
      db.businesses = [...db.businesses.filter((item) => item.id !== id), business]
      persist()
      return business
    })
  },

  saveBranch(kind, ownerId, input) {
    return respond('parties', () => {
      const owner = findOwner(kind, String(ownerId))
      if (!owner) throw notFound('Party')
      const branch: Branch = { ...input, id: input.id ?? nextId() }
      upsertBranch(owner, branch)
      persist()
      return branch
    })
  },

  // ---- Shipping bills ------------------------------------------------------

  listBills() {
    return respond('bills', () => {
      if (isEmptyForced('bills')) return []
      return [...database().bills].sort((a, b) => b.updated.localeCompare(a.updated)).map(summarize)
    })
  },

  getBill(id) {
    return respond('bills', () => database().bills.find((bill) => bill.id === id))
  },

  saveDraft(values, id) {
    return respond('submit', () => store(values, id, 'draft'))
  },

  submitBill(values, id) {
    return respond('submit', () => {
      const errors = { ...serverRules(values, id), ...validateBill(values) }
      if (Object.keys(errors).length > 0) throw new SubmissionRejectedError(errors)

      const bill = store(values, id, 'submitted')
      return { bill, referenceNumber: `SB-${bill.updated.slice(0, 4)}-${bill.id}` }
    })
  },

  getFlatFile(id) {
    return respond('download', () => {
      const bill = database().bills.find((item) => item.id === id)
      if (!bill) throw notFound('Shipping bill')
      return { filename: `shipping_bill_${bill.values.jobNumber ?? bill.id}.sb`, content: generateFlatFile(bill) }
    })
  }
}

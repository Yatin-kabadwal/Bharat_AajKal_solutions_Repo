import type {
  BillInvoiceForm,
  BillItemForm,
  ContainerForm,
  LicenseForm,
  PackingRangeForm,
  ShippingBillFormValues,
  SupportingDocForm
} from './types'

/** Today as `YYYY-MM-DD` (what `<input type="date">` produces). */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function emptyItem(): BillItemForm {
  return {
    ritcCode: '',
    goodsDescription1: '',
    quantity: '',
    unitOfMeasurement: 'PCS',
    unitPrice: '',
    lineTotal: '',
    tradeAgreementsCode: 'NCPTI'
  }
}

export function emptyInvoice(): BillInvoiceForm {
  return {
    invoiceNumber: '',
    invoiceDate: today(),
    currency: 'USD',
    contractType: 'FOB',
    buyerSameAsConsignee: true,
    buyerId: '',
    buyerBranchId: '',
    items: [emptyItem()]
  }
}

export function emptyContainer(): ContainerForm {
  return { containerNumber: '' }
}

export function emptyPackingRange(): PackingRangeForm {
  return { packingNumberFrom: '', packingNumberTo: '' }
}

export function emptyDocument(): SupportingDocForm {
  return { documentTypeCode: '', documentReferenceNumber: '', documentIssueDate: today() }
}

export function emptyLicense(): LicenseForm {
  return { registrationNumber: '' }
}

export function emptyBill(): ShippingBillFormValues {
  return {
    jobDate: today(),
    exporterId: '',
    exporterBranchId: '',
    consigneeId: '',
    consigneeBranchId: '',
    loadingPort: '',
    finalDestinationPort: '',
    natureOfCargo: 'P',
    measurementUnit: 'KG',
    invoices: [emptyInvoice()],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: []
  }
}

import { s } from 'core/form'
import { RITC_CODE_PATTERN } from '../domain/validation'

// Per-field rules (required, format, range) for react-hook-form, via fe-zen-arch's schema builder.
//
// IMPORTANT: fe-zen-arch looks a rule up by the *last segment* of the field path, so the rule for
// `invoices.2.items.0.quantity` is `shape.quantity`. That means every leaf name below must be unique
// across the whole form, or two different fields would silently share one rule. Keep it that way.
//
// Rules that compare fields with each other (net <= gross, dates, serial references, ...) are not
// here: they live in `domain/validation.ts`, which also runs on the server.

const positiveNumber = s.string().refine((value) => (Number(value) > 0 ? undefined : 'Enter a number above zero'))
const nonNegativeNumber = s
  .string()
  .optional()
  .refine((value) => (!value || Number(value) >= 0 ? undefined : 'Cannot be negative'))

const shipment = {
  jobNumber: s.string().optional(),
  jobDate: s.string(),
  exporterId: s.string(),
  exporterBranchId: s.string(),
  consigneeId: s.string(),
  consigneeBranchId: s.string(),
  loadingPort: s.string(),
  finalDestinationPort: s.string(),
  dischargePort: s.string().optional(),
  originStateCode: s.string().optional(),
  nfeiCategory: s.string().optional(),
  rbiWaiverNumber: s.string().optional(),
  rbiWaiverDate: s.string().optional(),
  sealType: s.string().optional(),
  numberOfContainers: s.string().optional(),
  natureOfCargo: s.string(),
  grossWeight: s.string().optional(),
  netWeight: s.string().optional(),
  measurementUnit: s.string(),
  totalPackages: s.string().optional(),
  marksAndNumbers: s.string().optional(),
  loosePackets: s.string().optional(),
  mawbNumber: s.string().optional(),
  hawbNumber: s.string().optional()
}

const invoice = {
  invoiceNumber: s.string(),
  invoiceDate: s.string(),
  currency: s.string(),
  invoiceTotal: nonNegativeNumber,
  contractType: s.string(),
  // Required only while "buyer same as consignee" is off: the buyer picker adds that rule itself.
  buyerId: s.string().optional(),
  buyerBranchId: s.string().optional(),
  thirdPartyId: s.string().optional(),
  thirdPartyBranchId: s.string().optional()
}

const item = {
  ritcCode: s.string().matches(RITC_CODE_PATTERN, 'Use an 8-digit code, e.g. 61091000'),
  goodsDescription1: s.string(),
  quantity: positiveNumber,
  unitOfMeasurement: s.string(),
  unitPrice: positiveNumber
}

const otherSections = {
  containerNumber: s.string(),
  packingNumberFrom: s.string(),
  packingNumberTo: s.string(),
  documentTypeCode: s.string(),
  documentReferenceNumber: s.string(),
  registrationNumber: s.string()
}

export const billSchema = s.object({ ...shipment, ...invoice, ...item, ...otherSections })

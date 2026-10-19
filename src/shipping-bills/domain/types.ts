// Domain types. These describe *what the form edits* and *what the API returns*.
// Nothing here depends on React, the form library or the mock layer.

// ---------------------------------------------------------------------------
// Master data (parties)
// ---------------------------------------------------------------------------

export interface Branch {
  id: number
  branchName: string
  address1: string
  address2?: string
  city: string
  state?: string
  pincode?: string
  countryCode: string
  email?: string
  mobile?: string
  gstnId?: string
  adCode?: string
  accountNo?: string
  ifscCode?: string
}

export interface Exporter {
  id: number
  name: string
  iec: string
  class: string
  type: string
  pan?: string
  tan?: string
  aeoNumber?: string
  website?: string
  notes?: string
  disabled?: boolean
  branches: Branch[]
}

export interface Business {
  id: number
  name: string
  iec?: string
  isConsignee: boolean
  isBuyer: boolean
  isNotify: boolean
  isThirdParty: boolean
  branches: Branch[]
}

export type PartyKind = 'exporter' | 'business'
export type Party = Exporter | Business
export type BusinessRole = 'consignee' | 'buyer' | 'thirdParty'

export interface PortOption {
  code: string
  name: string
  countryCode: string
}

// ---------------------------------------------------------------------------
// Form values. Numeric inputs are kept as strings because that is what an
// <input> produces; conversion happens once, in `payload.ts`.
// ---------------------------------------------------------------------------

export interface BillItemForm {
  ritcCode: string
  goodsDescription1: string
  goodsDescription2?: string
  goodsDescription3?: string
  accessoriesDescription?: string
  quantity: string
  unitOfMeasurement: string
  unitPrice: string
  schemeCode?: string
  unitOfRate?: string
  presentMarketValue?: string
  numberOfUnits?: string
  /** Optional manual override. When empty the total is quantity x unit price. */
  lineTotal?: string
  accessoryStatus?: string
  thirdPartyItem?: boolean
  itemThirdPartyId?: string
  itemThirdPartyBranchId?: string
  ar4Number?: string
  ar4Date?: string
  ar4Commissionerate?: string
  ar4Division?: string
  ar4Range?: string
  ar4Remarks?: string
  igstPaymentStatus?: string
  taxableValue?: string
  igstAmount?: string
  mainDbkSerialNumber?: string
  drawbackSerialNumber?: string
  drawbackUnit?: string
  drawbackQuantity?: string
  customRateAdv?: string
  customRateSpec?: string
  totalDbkAmount?: string
  dbkAdv?: string
  dbkRateSpec?: string
  rosctlSerialNumber?: string
  centralTaxLevyDuty?: string
  centralTaxLevyRate?: string
  stateLevyDuty?: string
  stateLevyRate?: string
  rosctlQuantity?: string
  rosctlAmount?: string
  rodtep?: string
  rodtepRate?: string
  rodtepCap?: string
  rodtepQuantity?: string
  rodtepUnit?: string
  rodtepAmount?: string
  cess?: string
  originDistrictCode?: string
  tradeAgreementsCode?: string
  endUseOfItem?: string
  totalPackage?: string
  rewardItem?: boolean
}

/** Invoice-level charges that can be entered either as a % rate or as an absolute amount. */
export const chargeKeys = ['freight', 'insurance', 'commission', 'discount', 'otherDeductions'] as const
export type ChargeKey = (typeof chargeKeys)[number]

export interface BillInvoiceForm {
  invoiceNumber: string
  invoiceDate: string
  currency: string
  contractType: string
  buyerSameAsConsignee: boolean
  buyerId: string
  buyerBranchId: string
  thirdPartyId?: string
  thirdPartyBranchId?: string
  freightRate?: string
  freightAmount?: string
  freightCurrency?: string
  insuranceRate?: string
  insuranceAmount?: string
  insuranceCurrency?: string
  commissionRate?: string
  commissionAmount?: string
  commissionCurrency?: string
  discountRate?: string
  discountAmount?: string
  discountCurrency?: string
  otherDeductionsRate?: string
  otherDeductionsAmount?: string
  otherDeductionsCurrency?: string
  packingCharges?: string
  freightInsuranceIncluded?: string
  contractNumber?: string
  natureOfPayment?: string
  periodOfPayment?: string
  /** Optional manual override. When empty the total is the sum of the item totals. */
  invoiceTotal?: string
  items: BillItemForm[]
}

export interface ContainerForm {
  containerNumber: string
  containerSize?: string
  exciseSealNumber?: string
  sealDate?: string
  sealType?: string
  sealDeviceId?: string
  movementDocumentType?: string
  movementDocumentNumber?: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  documentTypeCode?: string
  imageReferenceNumber?: string
}

export interface PackingRangeForm {
  packingNumberFrom: string
  packingNumberTo: string
  packingCode?: string
}

export interface SupportingDocForm {
  documentTypeCode: string
  documentReferenceNumber: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  imageReferenceNumber?: string
  documentIssueDate?: string
  documentExpiryDate?: string
  placeOfIssue?: string
  issuingPartyCode?: string
  issuingPartyName?: string
  issuingPartyAddress1?: string
  issuingPartyAddress2?: string
  issuingPartyCity?: string
  issuingPartyPin?: string
  beneficiaryPartyCode?: string
  beneficiaryPartyName?: string
  beneficiaryPartyAddress1?: string
  beneficiaryPartyAddress2?: string
  beneficiaryPartyCity?: string
  beneficiaryPartyPin?: string
  fileType?: string
  icegateId?: string
}

export interface LicenseForm {
  registrationNumber: string
  registrationDate?: string
  invoiceSerialNumber?: string
  itemSerialNumber?: string
  licenseSerialNumber?: string
  itemSerialNumberPartE?: string
  itemSerialNumberPartC?: string
  licenseQuantity?: string
  licenseExportQuantity?: string
  indigenousOrImported?: string
}

export interface ShippingBillFormValues {
  jobNumber?: string
  jobDate: string
  exporterId: string
  exporterBranchId: string
  exporterName?: string
  consigneeId: string
  consigneeBranchId: string
  consigneeName?: string
  loadingPort: string
  finalDestinationPort: string
  dischargePort?: string
  originStateCode?: string
  nfeiCategory?: string
  rbiWaiverNumber?: string
  rbiWaiverDate?: string
  sealType?: string
  numberOfContainers?: string
  natureOfCargo: string
  grossWeight?: string
  netWeight?: string
  measurementUnit: string
  totalPackages?: string
  marksAndNumbers?: string
  loosePackets?: string
  mawbNumber?: string
  hawbNumber?: string
  invoices: BillInvoiceForm[]
  containers: ContainerForm[]
  packingRanges: PackingRangeForm[]
  documents: SupportingDocForm[]
  licenses: LicenseForm[]
  exchangeRate?: string
  chaNumber?: string
  chaName?: string
}

// ---------------------------------------------------------------------------
// Persisted bill
// ---------------------------------------------------------------------------

export type BillStatus = 'draft' | 'submitted'

export interface SavedBill {
  id: number
  status: BillStatus
  created: string
  updated: string
  values: ShippingBillFormValues
}

/** One row of the shipping bill list. The server resolves names and totals, so the list stays light. */
export interface BillSummary {
  id: number
  status: BillStatus
  jobNumber?: string
  jobDate: string
  exporterName: string
  consigneeName: string
  loadingPort: string
  finalDestinationPort: string
  invoiceNumbers: string[]
  /** Invoice totals per currency: adding USD to EUR would be meaningless. */
  totals: { currency: string; amount: number }[]
  updated: string
}

// ---------------------------------------------------------------------------
// Reference data used by selects
// ---------------------------------------------------------------------------

export interface Option {
  value: string | number
  label: string
}

export interface SchemeOption extends Option {
  /** Schemes that unlock the drawback / RoDTEP / ROSCTL inputs on an item. */
  drawback: boolean
  RODTEP: boolean
  ROSCTL: boolean
}

export interface FormOptions {
  currencies: Option[]
  countries: Option[]
  states: Option[]
  cargoTypes: Option[]
  sealTypes: Option[]
  contractTypes: Option[]
  weightUnits: Option[]
  paymentTypes: Option[]
  priceInclusionTypes: Option[]
  schemeCodes: SchemeOption[]
  quantityCodes: Option[]
  tradeAgreements: Option[]
  igstPaymentStatuses: Option[]
  accessoryStatuses: Option[]
  nfeiCategories: Option[]
  containerSizes: Option[]
  containerSealTypes: Option[]
  licenseSources: Option[]
  documentFileTypes: Option[]
  exporterClasses: Option[]
  exporterTypes: Option[]
}

// ---------------------------------------------------------------------------
// Submission results
// ---------------------------------------------------------------------------

/** Field path -> message, e.g. `invoices.0.invoiceNumber`. */
export type FieldErrors = Record<string, string>

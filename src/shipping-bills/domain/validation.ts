import { chargeAmount, isBlank, itemsTotal, parseNumber, sameAmount } from './calculations'
import { isIndianPort } from './ports'
import { chargeKeys, type FieldErrors, type ShippingBillFormValues } from './types'

// Cross-field and format rules for a shipping bill.
//
// Required-ness and simple per-field rules live in the form schema (`form/bill-schema.ts`) so the
// inputs can show them inline. This module holds the rules that relate fields to each other. It is
// a pure function, so the form runs it before submitting and the (mock) server runs the very same
// rules again, exactly as a real backend would.
//
// Assumptions are listed in the README ("Domain assumptions"). Each rule below names the field it
// is reported on, so the UI can show the message next to the input and jump to the right tab.

export const CONTAINER_NUMBER_PATTERN = /^[A-Z]{4}\d{7}$/ // ISO 6346, e.g. MSCU1234567
export const RITC_CODE_PATTERN = /^\d{8}$/ // 8-digit HS / RITC code
const CONTAINERIZED_CARGO = ['C', 'CP']

interface ValidationContext {
  /** `YYYY-MM-DD`. Injected so the rules stay deterministic in tests. */
  today: string
}

export function validateBill(
  values: ShippingBillFormValues,
  { today }: ValidationContext = { today: new Date().toISOString().slice(0, 10) }
): FieldErrors {
  const errors: FieldErrors = {}
  // First message wins: it is the one the user should fix first.
  function fail(path: string, message: string) {
    errors[path] ??= message
  }

  validateShipment(values, today, fail)
  validateInvoices(values, today, fail)
  validateContainers(values, fail)
  validatePackingRanges(values, fail)
  validateDocuments(values, today, fail)
  validateLicenses(values, today, fail)

  return errors
}

type Fail = (path: string, message: string) => void

function validateShipment(values: ShippingBillFormValues, today: string, fail: Fail) {
  if (values.jobDate > today) fail('jobDate', 'Job date cannot be in the future')

  if (values.loadingPort && !isIndianPort(values.loadingPort)) {
    fail('loadingPort', 'Port of loading must be an Indian port')
  }
  if (values.finalDestinationPort && isIndianPort(values.finalDestinationPort)) {
    fail('finalDestinationPort', 'Final destination must be outside India')
  }

  const gross = parseNumber(values.grossWeight)
  const net = parseNumber(values.netWeight)
  if (gross != null && gross <= 0) fail('grossWeight', 'Gross weight must be above zero')
  if (net != null && net <= 0) fail('netWeight', 'Net weight must be above zero')
  if (gross != null && net != null && net > gross) fail('netWeight', 'Net weight cannot exceed gross weight')

  // A waiver is identified by its number and its date together.
  if (!isBlank(values.rbiWaiverNumber) && isBlank(values.rbiWaiverDate)) {
    fail('rbiWaiverDate', 'Enter the RBI waiver date')
  }
  if (isBlank(values.rbiWaiverNumber) && !isBlank(values.rbiWaiverDate)) {
    fail('rbiWaiverNumber', 'Enter the RBI waiver number')
  }

  const declaredContainers = parseNumber(values.numberOfContainers) ?? 0
  if (
    CONTAINERIZED_CARGO.includes(values.natureOfCargo) &&
    values.containers.length === 0 &&
    declaredContainers === 0
  ) {
    fail('natureOfCargo', 'Containerized cargo needs at least one container (see the Others tab)')
  }

  const packages = parseNumber(values.totalPackages)
  if (packages != null && (!Number.isInteger(packages) || packages <= 0)) {
    fail('totalPackages', 'Total packages must be a whole number above zero')
  }
}

function validateInvoices(values: ShippingBillFormValues, today: string, fail: Fail) {
  if (values.invoices.length === 0) fail('invoices', 'Add at least one invoice')

  const seenNumbers = new Map<string, number>()

  values.invoices.forEach((invoice, i) => {
    const at = `invoices.${i}`
    const number = invoice.invoiceNumber.trim().toLowerCase()

    if (number) {
      if (seenNumbers.has(number))
        fail(`${at}.invoiceNumber`, `Already used by invoice ${seenNumbers.get(number)! + 1}`)
      else seenNumbers.set(number, i)
    }

    // An invoice is raised before the bill is filed.
    if (invoice.invoiceDate > values.jobDate) fail(`${at}.invoiceDate`, 'Invoice date cannot be after the job date')
    if (invoice.invoiceDate > today) fail(`${at}.invoiceDate`, 'Invoice date cannot be in the future')

    if (!invoice.buyerSameAsConsignee && invoice.buyerId && invoice.buyerId === values.consigneeId) {
      fail(`${at}.buyerId`, 'Buyer is the same as the consignee. Tick "same as consignee" instead')
    }

    if (invoice.items.length === 0) fail(`${at}.items`, 'Add at least one item')

    chargeKeys.forEach((key) => {
      const rate = parseNumber(invoice[`${key}Rate`])
      const amount = parseNumber(invoice[`${key}Amount`])
      if (rate != null && amount != null) fail(`${at}.${key}Amount`, 'Enter either a rate or an amount, not both')
      if (rate != null && (rate < 0 || rate > 100)) fail(`${at}.${key}Rate`, 'Rate must be between 0 and 100')
      if (amount != null && amount < 0) fail(`${at}.${key}Amount`, 'Amount cannot be negative')
    })

    const total = itemsTotal(invoice)
    if (chargeAmount(invoice, 'discount') > total) fail(`${at}.discountAmount`, 'Discount exceeds the invoice value')

    const declaredTotal = parseNumber(invoice.invoiceTotal)
    if (declaredTotal != null && !sameAmount(declaredTotal, total)) {
      fail(
        `${at}.invoiceTotal`,
        `Total does not match the items (${total.toFixed(2)}). Clear it to use the items total`
      )
    }

    invoice.items.forEach((item, j) => {
      const item_at = `${at}.items.${j}`

      const manualTotal = parseNumber(item.lineTotal)
      if (manualTotal != null && manualTotal < 0) fail(`${item_at}.lineTotal`, 'Item total cannot be negative')

      if (item.igstPaymentStatus === 'P') {
        if ((parseNumber(item.taxableValue) ?? 0) <= 0) fail(`${item_at}.taxableValue`, 'Enter the taxable value')
        if ((parseNumber(item.igstAmount) ?? 0) <= 0) fail(`${item_at}.igstAmount`, 'Enter the IGST amount')
      }

      if (item.thirdPartyItem) {
        if (!item.itemThirdPartyId) fail(`${item_at}.itemThirdPartyId`, 'Select the third party')
        else if (!item.itemThirdPartyBranchId) fail(`${item_at}.itemThirdPartyBranchId`, 'Select a branch')
      }

      if (!isBlank(item.ar4Number) && isBlank(item.ar4Date)) fail(`${item_at}.ar4Date`, 'Enter the AR4 date')
      if (isBlank(item.ar4Number) && !isBlank(item.ar4Date)) fail(`${item_at}.ar4Number`, 'Enter the AR4 number')
    })
  })
}

function validateContainers(values: ShippingBillFormValues, fail: Fail) {
  const seen = new Set<string>()
  values.containers.forEach((container, i) => {
    const number = container.containerNumber.trim().toUpperCase()
    if (!number) return // "required" is reported by the form schema
    if (!CONTAINER_NUMBER_PATTERN.test(number)) {
      fail(`containers.${i}.containerNumber`, 'Use 4 letters followed by 7 digits, e.g. MSCU1234567')
    } else if (seen.has(number)) {
      fail(`containers.${i}.containerNumber`, 'Duplicate container number')
    }
    seen.add(number)
  })
}

function validatePackingRanges(values: ShippingBillFormValues, fail: Fail) {
  const ranges: { from: number; to: number; index: number }[] = []

  values.packingRanges.forEach((range, index) => {
    const from = parseNumber(range.packingNumberFrom)
    const to = parseNumber(range.packingNumberTo)
    if (from == null || to == null) {
      if (from == null) fail(`packingRanges.${index}.packingNumberFrom`, 'Enter the first package number')
      if (to == null) fail(`packingRanges.${index}.packingNumberTo`, 'Enter the last package number')
      return
    }
    if (from < 1) fail(`packingRanges.${index}.packingNumberFrom`, 'Package numbers start at 1')
    if (to < from) fail(`packingRanges.${index}.packingNumberTo`, 'Must not be lower than the first package')
    else ranges.push({ from, to, index })
  })

  ranges.forEach((range, i) => {
    const overlaps = ranges.slice(0, i).some((other) => range.from <= other.to && other.from <= range.to)
    if (overlaps) fail(`packingRanges.${range.index}.packingNumberFrom`, 'Overlaps another range')
  })

  const total = parseNumber(values.totalPackages)
  const highest = Math.max(0, ...ranges.map((range) => range.to))
  if (total != null && highest > total) {
    fail('totalPackages', `Packing list goes up to package ${highest}, more than the total packages`)
  }
}

/** Documents and licences may point at "invoice N, item M" - check that the target exists. */
function validateSerialReference(
  values: ShippingBillFormValues,
  at: string,
  invoiceSerial: string | undefined,
  itemSerial: string | undefined,
  fail: Fail
) {
  const invoiceNo = parseNumber(invoiceSerial)
  const itemNo = parseNumber(itemSerial)

  if (invoiceNo != null && (!Number.isInteger(invoiceNo) || invoiceNo < 1 || invoiceNo > values.invoices.length)) {
    fail(`${at}.invoiceSerialNumber`, `There is no invoice ${invoiceSerial}. This bill has ${values.invoices.length}`)
    return
  }
  if (itemNo != null) {
    const invoice = values.invoices[(invoiceNo ?? 1) - 1]
    if (!Number.isInteger(itemNo) || itemNo < 1 || itemNo > invoice.items.length) {
      fail(`${at}.itemSerialNumber`, `There is no item ${itemSerial} on invoice ${invoiceNo ?? 1}`)
    }
  }
}

function validateDocuments(values: ShippingBillFormValues, today: string, fail: Fail) {
  values.documents.forEach((doc, i) => {
    const at = `documents.${i}`
    if (doc.documentIssueDate && doc.documentIssueDate > today) {
      fail(`${at}.documentIssueDate`, 'Issue date cannot be in the future')
    }
    if (doc.documentIssueDate && doc.documentExpiryDate && doc.documentExpiryDate < doc.documentIssueDate) {
      fail(`${at}.documentExpiryDate`, 'Expiry date cannot be before the issue date')
    }
    validateSerialReference(values, at, doc.invoiceSerialNumber, doc.itemSerialNumber, fail)
  })
}

function validateLicenses(values: ShippingBillFormValues, today: string, fail: Fail) {
  values.licenses.forEach((license, i) => {
    const at = `licenses.${i}`
    if (license.registrationDate && license.registrationDate > today) {
      fail(`${at}.registrationDate`, 'Registration date cannot be in the future')
    }
    const licenceQty = parseNumber(license.licenseQuantity)
    const exportQty = parseNumber(license.licenseExportQuantity)
    if (licenceQty != null && exportQty != null && exportQty > licenceQty) {
      fail(`${at}.licenseExportQuantity`, 'Export quantity cannot exceed the licence quantity')
    }
    validateSerialReference(values, at, license.invoiceSerialNumber, license.itemSerialNumber, fail)
  })
}

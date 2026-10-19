import { lineTotal } from './calculations'
import type { SavedBill } from './types'

// Builds the ICEGATE-style `.sb` flat file for a bill. Pure text generation, no I/O, so it can be
// reused unchanged when the backend takes over (or compared against the backend's output in tests).

const DEFAULT_PORT = 'INMUN1'

/** `value`, or `fallback` when it is blank. */
function orElse<T extends string | number>(value: string | undefined, fallback: T): string | T {
  return value == null || value.trim() === '' ? fallback : value
}

/** `^` separates columns and line breaks end a record, so neither may appear inside a value. */
function cell(value: string | number | undefined): string {
  return String(value ?? '').replace(/[\^\r\n]+/g, ' ')
}

function row(...cells: (string | number | undefined)[]): string {
  return `<R>${cells.map(cell).join('^')}`
}

export function generateFlatFile(bill: SavedBill): string {
  const v = bill.values
  const port = orElse(v.loadingPort, DEFAULT_PORT)
  const lines: string[] = [`HREC**ZZ*${port}*ZZ*ICEGATE*01*SB*1.0*`]

  lines.push(
    '<TABLE>SHIPPING_BILL',
    '<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS',
    row(
      'F',
      1000,
      orElse(v.jobNumber, bill.id),
      v.jobDate,
      v.exporterId,
      v.exporterBranchId,
      v.consigneeId,
      v.loadingPort,
      v.finalDestinationPort,
      orElse(v.dischargePort, v.finalDestinationPort),
      v.sealType,
      v.natureOfCargo,
      v.grossWeight,
      v.netWeight,
      v.measurementUnit,
      v.totalPackages,
      v.marksAndNumbers
    )
  )

  if (v.invoices.length > 0) {
    lines.push(
      '<TABLE>INVOICE',
      '<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT'
    )
    v.invoices.forEach((invoice, index) => {
      const buyerId = invoice.buyerSameAsConsignee ? v.consigneeId : invoice.buyerId
      lines.push(
        row(
          index + 1,
          invoice.invoiceNumber,
          invoice.invoiceDate,
          invoice.currency,
          invoice.contractType,
          buyerId,
          orElse(invoice.freightAmount, 0),
          orElse(invoice.insuranceAmount, 0)
        )
      )
    })

    lines.push(
      '<TABLE>ITEM',
      '<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE'
    )
    v.invoices.forEach((invoice, invoiceIndex) => {
      invoice.items.forEach((item, itemIndex) => {
        lines.push(
          row(
            invoiceIndex + 1,
            itemIndex + 1,
            item.ritcCode,
            item.goodsDescription1,
            item.quantity,
            item.unitOfMeasurement,
            item.unitPrice,
            lineTotal(item).toFixed(2),
            item.schemeCode
          )
        )
      })
    })
  }

  if (v.packingRanges.length > 0) {
    lines.push('<TABLE>PACKING', '<F>FROM_PKG^TO_PKG^PKG_CODE')
    v.packingRanges.forEach((range) => {
      lines.push(row(range.packingNumberFrom, range.packingNumberTo, orElse(range.packingCode, 'CTN')))
    })
  }

  lines.push(`TREC**ZZ*${port}*ZZ*ICEGATE*01*SB*1.0*`)
  return lines.join('\r\n')
}

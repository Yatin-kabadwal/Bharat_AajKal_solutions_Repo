/// <reference types="node" />
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { emptyBill, emptyContainer, emptyItem } from './defaults'
import { generateFlatFile } from './flat-file'
import { toShippingBillPayload } from './payload'
import type { SavedBill, ShippingBillFormValues } from './types'

function bill(): ShippingBillFormValues {
  const base = emptyBill()
  return {
    ...base,
    jobDate: '2026-10-10',
    exporterId: '1000',
    exporterBranchId: '1001',
    consigneeId: '2002',
    consigneeBranchId: '2003',
    loadingPort: 'INMUN1',
    finalDestinationPort: 'USMSY',
    grossWeight: '12.5',
    invoices: [
      {
        ...base.invoices[0],
        invoiceNumber: 'INV-1',
        freightRate: '',
        items: [
          {
            ...emptyItem(),
            ritcCode: '61091000',
            goodsDescription1: 'Shirts; "blue"^',
            quantity: '3',
            unitPrice: '2.5'
          }
        ]
      }
    ]
  }
}

describe('toShippingBillPayload', () => {
  const payload = toShippingBillPayload(bill())

  it('converts numeric strings to numbers and drops blanks', () => {
    assert.equal(payload.shipping_bill.exporter, 1000)
    assert.equal(payload.shipping_bill.grossweight, 12.5)
    assert.equal(payload.shipping_bill.netweight, undefined)
    assert.equal(payload.shipping_bill.rbi_waiver_number, undefined)
  })

  it('derives countries from the port codes', () => {
    assert.equal(payload.shipping_bill.loading_country_code, 'IN')
    assert.equal(payload.shipping_bill.final_destination_country_code, 'US')
  })

  it('defaults the discharge port to the destination', () => {
    assert.equal(payload.shipping_bill.discharge_port, 'USMSY')
    const explicit = toShippingBillPayload({ ...bill(), dischargePort: 'SGSIN' })
    assert.equal(explicit.shipping_bill.discharge_port, 'SGSIN')
    assert.equal(explicit.shipping_bill.discharge_country_code, 'SG')
  })

  it('numbers invoices and items from their position and computes totals', () => {
    const [invoice] = payload.invoices
    assert.equal(invoice.serial_number, 1)
    assert.equal(invoice.items[0].item_serial_number, 1)
    assert.equal(invoice.items[0].line_total, 7.5)
    assert.equal(invoice.invoice_total, 7.5)
  })

  it('uses the consignee as buyer when they are the same, and the invoice currency for blank charge currencies', () => {
    const [invoice] = payload.invoices
    assert.equal(invoice.buyer, 2002)
    assert.equal(invoice.buyer_address, 2003)
    assert.equal(invoice.freight_currency, 'USD')
  })

  it('counts listed containers over a typed count', () => {
    const withContainers = { ...bill(), numberOfContainers: '9', containers: [emptyContainer(), emptyContainer()] }
    assert.equal(toShippingBillPayload(withContainers).shipping_bill.number_of_containers, 2)
    assert.equal(toShippingBillPayload({ ...bill(), numberOfContainers: '9' }).shipping_bill.number_of_containers, 9)
  })

  it('only sends taxable value and IGST when IGST is paid', () => {
    const values = bill()
    Object.assign(values.invoices[0].items[0], { taxableValue: '10', igstAmount: '1.8', igstPaymentStatus: 'LUT' })
    assert.equal(toShippingBillPayload(values).invoices[0].items[0].igst_amount, undefined)
    values.invoices[0].items[0].igstPaymentStatus = 'P'
    assert.equal(toShippingBillPayload(values).invoices[0].items[0].igst_amount, 1.8)
  })
})

describe('generateFlatFile', () => {
  const saved: SavedBill = { id: 7, status: 'draft', created: '', updated: '', values: bill() }
  const lines = generateFlatFile(saved).split('\r\n')

  it('is wrapped in header and trailer records', () => {
    assert.match(lines[0], /^HREC\*\*ZZ\*INMUN1/)
    assert.match(lines.at(-1)!, /^TREC\*\*ZZ\*INMUN1/)
  })

  it('writes one row per invoice and item, with the computed line total', () => {
    const itemRow = lines.find((line) => line.startsWith('<R>1^1^61091000'))
    assert.ok(itemRow)
    assert.ok(itemRow.includes('^7.50^'))
  })

  it('keeps column and record separators out of values', () => {
    const itemRow = lines.find((line) => line.startsWith('<R>1^1^61091000'))!
    assert.equal(itemRow.split('^').length, 9)
    assert.ok(itemRow.includes('Shirts; "blue" '))
  })
})

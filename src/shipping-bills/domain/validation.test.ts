/// <reference types="node" />
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { emptyBill, emptyContainer, emptyDocument, emptyItem, emptyLicense, emptyPackingRange } from './defaults'
import { tabForPath } from './form-tabs'
import type { ShippingBillFormValues } from './types'
import { validateBill } from './validation'

const today = '2026-10-17'

/** A bill that passes every rule. Each test breaks exactly one thing. */
function validBill(): ShippingBillFormValues {
  const bill = emptyBill()
  return {
    ...bill,
    jobDate: '2026-10-10',
    exporterId: '1000',
    exporterBranchId: '1001',
    consigneeId: '2002',
    consigneeBranchId: '2003',
    loadingPort: 'INMUN1',
    finalDestinationPort: 'USMSY',
    invoices: [
      {
        ...bill.invoices[0],
        invoiceNumber: 'INV-1',
        invoiceDate: '2026-10-09',
        items: [{ ...emptyItem(), ritcCode: '61091000', goodsDescription1: 'Shirts', quantity: '10', unitPrice: '2' }]
      }
    ]
  }
}

function errorsFor(change: (bill: ShippingBillFormValues) => void) {
  const bill = validBill()
  change(bill)
  return validateBill(bill, { today })
}

describe('validateBill', () => {
  it('accepts a valid bill', () => {
    assert.deepEqual(validateBill(validBill(), { today }), {})
  })

  describe('shipment', () => {
    it('rejects a future job date', () => {
      assert.match(errorsFor((b) => (b.jobDate = '2026-12-01')).jobDate, /future/)
    })

    it('requires an Indian loading port and a foreign destination', () => {
      assert.match(errorsFor((b) => (b.loadingPort = 'USLAX')).loadingPort, /Indian/)
      assert.match(errorsFor((b) => (b.finalDestinationPort = 'INNSA1')).finalDestinationPort, /outside India/)
    })

    it('rejects net weight above gross weight', () => {
      const errors = errorsFor((b) => {
        b.grossWeight = '10'
        b.netWeight = '12'
      })
      assert.match(errors.netWeight, /exceed gross/)
    })

    it('accepts net weight equal to gross weight', () => {
      const errors = errorsFor((b) => {
        b.grossWeight = '10'
        b.netWeight = '10'
      })
      assert.equal(errors.netWeight, undefined)
    })

    it('needs an RBI waiver number and date together', () => {
      assert.match(errorsFor((b) => (b.rbiWaiverNumber = 'W1')).rbiWaiverDate, /date/)
      assert.match(errorsFor((b) => (b.rbiWaiverDate = '2026-01-01')).rbiWaiverNumber, /number/)
    })

    it('requires containers for containerized cargo', () => {
      assert.match(errorsFor((b) => (b.natureOfCargo = 'C')).natureOfCargo, /container/)
      const withContainer = errorsFor((b) => {
        b.natureOfCargo = 'C'
        b.containers = [{ ...emptyContainer(), containerNumber: 'MSCU1234567' }]
      })
      assert.equal(withContainer.natureOfCargo, undefined)
    })
  })

  describe('invoices', () => {
    it('rejects an invoice dated after the job', () => {
      const errors = errorsFor((b) => (b.invoices[0].invoiceDate = '2026-10-11'))
      assert.match(errors['invoices.0.invoiceDate'], /after the job date/)
    })

    it('rejects duplicate invoice numbers, ignoring case', () => {
      const errors = errorsFor((b) => {
        b.invoices.push({ ...b.invoices[0], invoiceNumber: 'inv-1' })
      })
      assert.match(errors['invoices.1.invoiceNumber'], /invoice 1/)
    })

    it('rejects a rate and an amount for the same charge', () => {
      const errors = errorsFor((b) => {
        b.invoices[0].freightRate = '5'
        b.invoices[0].freightAmount = '3'
      })
      assert.match(errors['invoices.0.freightAmount'], /either a rate or an amount/)
    })

    it('rejects a declared total that disagrees with the items', () => {
      const errors = errorsFor((b) => (b.invoices[0].invoiceTotal = '99'))
      assert.match(errors['invoices.0.invoiceTotal'], /20\.00/)
    })

    it('requires taxable value and IGST when IGST is paid', () => {
      const errors = errorsFor((b) => (b.invoices[0].items[0].igstPaymentStatus = 'P'))
      assert.ok(errors['invoices.0.items.0.taxableValue'])
      assert.ok(errors['invoices.0.items.0.igstAmount'])
    })

    it('requires the third party of a third-party item', () => {
      const errors = errorsFor((b) => (b.invoices[0].items[0].thirdPartyItem = true))
      assert.ok(errors['invoices.0.items.0.itemThirdPartyId'])
    })
  })

  describe('containers and packing', () => {
    it('checks the ISO 6346 container number format and duplicates', () => {
      const errors = errorsFor((b) => {
        b.containers = [
          { ...emptyContainer(), containerNumber: 'BAD' },
          { ...emptyContainer(), containerNumber: 'MSCU1234567' },
          { ...emptyContainer(), containerNumber: 'mscu1234567' }
        ]
      })
      assert.match(errors['containers.0.containerNumber'], /4 letters/)
      assert.equal(errors['containers.1.containerNumber'], undefined)
      assert.match(errors['containers.2.containerNumber'], /Duplicate/)
    })

    it('rejects reversed and overlapping packing ranges', () => {
      const errors = errorsFor((b) => {
        b.packingRanges = [
          { ...emptyPackingRange(), packingNumberFrom: '1', packingNumberTo: '5' },
          { ...emptyPackingRange(), packingNumberFrom: '4', packingNumberTo: '8' },
          { ...emptyPackingRange(), packingNumberFrom: '9', packingNumberTo: '7' }
        ]
      })
      assert.match(errors['packingRanges.1.packingNumberFrom'], /Overlaps/)
      assert.match(errors['packingRanges.2.packingNumberTo'], /lower than/)
    })

    it('rejects a packing list that runs past the total packages', () => {
      const errors = errorsFor((b) => {
        b.totalPackages = '5'
        b.packingRanges = [{ ...emptyPackingRange(), packingNumberFrom: '1', packingNumberTo: '8' }]
      })
      assert.match(errors.totalPackages, /up to package 8/)
    })
  })

  describe('documents and licences', () => {
    it('checks that an invoice / item reference points at something that exists', () => {
      const errors = errorsFor((b) => {
        b.documents = [{ ...emptyDocument(), invoiceSerialNumber: '2' }]
        b.licenses = [{ ...emptyLicense(), itemSerialNumber: '3' }]
      })
      assert.match(errors['documents.0.invoiceSerialNumber'], /no invoice 2/)
      assert.match(errors['licenses.0.itemSerialNumber'], /no item 3/)
    })

    it('rejects an expiry before the issue date', () => {
      const errors = errorsFor((b) => {
        b.documents = [{ ...emptyDocument(), documentIssueDate: '2026-10-01', documentExpiryDate: '2026-09-01' }]
      })
      assert.match(errors['documents.0.documentExpiryDate'], /before the issue date/)
    })

    it('rejects an export quantity above the licence quantity', () => {
      const errors = errorsFor((b) => {
        b.licenses = [{ ...emptyLicense(), licenseQuantity: '10', licenseExportQuantity: '11' }]
      })
      assert.match(errors['licenses.0.licenseExportQuantity'], /exceed/)
    })
  })
})

describe('tabForPath', () => {
  it('maps field paths to the tab that shows them', () => {
    assert.equal(tabForPath('exporterId'), 'details')
    assert.equal(tabForPath('invoices.0.items.1.quantity'), 'invoices')
    assert.equal(tabForPath('containers.0.containerNumber'), 'documents')
    assert.equal(tabForPath('licenses.0.registrationNumber'), 'documents')
  })
})

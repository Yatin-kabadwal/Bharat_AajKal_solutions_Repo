/// <reference types="node" />
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { emptyBill, emptyItem } from '../../domain/defaults'
import type { ShippingBillFormValues } from '../../domain/types'
import { SubmissionRejectedError } from '../contract'
import { mockShippingBillApi as api } from './mock-api'

// These tests exercise the service boundary the UI depends on: what it returns, what it rejects with,
// and that callers can never mutate the mock database through a returned object.

function validBill(invoiceNumber: string): ShippingBillFormValues {
  const base = emptyBill()
  return {
    ...base,
    jobDate: '2026-09-01',
    exporterId: '1000',
    exporterBranchId: '1001',
    consigneeId: '2002',
    consigneeBranchId: '2003',
    loadingPort: 'INMUN1',
    finalDestinationPort: 'USMSY',
    invoices: [
      {
        ...base.invoices[0],
        invoiceNumber,
        invoiceDate: '2026-08-30',
        items: [{ ...emptyItem(), ritcCode: '61091000', goodsDescription1: 'Shirts', quantity: '2', unitPrice: '5' }]
      }
    ]
  }
}

describe('reference data', () => {
  it('returns the form options', async () => {
    const options = await api.getFormOptions()
    assert.ok(options.currencies.length > 0)
    assert.ok(options.schemeCodes.some((scheme) => scheme.drawback))
  })

  it('returns only Indian ports for loading and only foreign ports for destinations', async () => {
    const loading = await api.searchPorts('loading', '')
    const destination = await api.searchPorts('destination', '')
    assert.ok(loading.length > 0 && loading.every((port) => port.countryCode === 'IN'))
    assert.ok(destination.length > 0 && destination.every((port) => port.countryCode !== 'IN'))
  })

  it('searches ports by name or code, case-insensitively, and can return nothing', async () => {
    assert.equal((await api.searchPorts('destination', 'sgsin')).at(0)?.code, 'SGSIN')
    assert.deepEqual(await api.searchPorts('destination', 'zzzz'), [])
  })
})

describe('parties', () => {
  it('searches businesses by role', async () => {
    const thirdParties = await api.searchBusinesses('thirdParty', '')
    assert.ok(thirdParties.length > 0 && thirdParties.every((business) => business.isThirdParty))
  })

  it('creates a party with its first branch, and finds it afterwards', async () => {
    const saved = await api.saveBusiness({
      name: 'Zeta Imports',
      isConsignee: true,
      isBuyer: false,
      isNotify: false,
      isThirdParty: false,
      firstBranch: { branchName: 'HQ', address1: '1 Main St', city: 'Oslo', countryCode: 'NO' }
    })
    assert.equal(saved.branches.length, 1)
    assert.deepEqual(
      (await api.searchBusinesses('consignee', 'zeta')).map((b) => b.id),
      [saved.id]
    )
    assert.equal((await api.searchBranches('business', String(saved.id), 'oslo')).length, 1)
  })

  it('returns copies, so callers cannot change stored data', async () => {
    const [first] = await api.searchExporters('')
    first.name = 'Tampered'
    assert.notEqual((await api.getExporter(String(first.id)))?.name, 'Tampered')
  })
})

describe('shipping bills', () => {
  it('lists summaries with resolved names and per-currency totals, newest first', async () => {
    const bills = await api.listBills()
    assert.ok(bills.length >= 2)
    assert.ok(bills.every((bill, i) => i === 0 || bills[i - 1].updated >= bill.updated))
    const seeded = bills.find((bill) => bill.id === 3000)!
    assert.equal(seeded.exporterName, 'Aarav Textiles Pvt Ltd')
    assert.deepEqual(seeded.totals, [{ currency: 'USD', amount: 51 * 3.831 }])
  })

  it('returns undefined for an unknown bill', async () => {
    assert.equal(await api.getBill(999999), undefined)
  })

  it('saves an incomplete draft without validating it', async () => {
    const draft = await api.saveDraft(emptyBill())
    assert.equal(draft.status, 'draft')
    assert.equal((await api.getBill(draft.id))?.status, 'draft')
  })

  it('rejects saving a draft over a bill that does not exist', async () => {
    await assert.rejects(() => api.saveDraft(emptyBill(), 424242), { status: 404 })
  })

  it('submits a valid bill and marks it submitted', async () => {
    const { bill, referenceNumber } = await api.submitBill(validBill('MOCK-OK-1'))
    assert.equal(bill.status, 'submitted')
    assert.equal(referenceNumber, `SB-${bill.updated.slice(0, 4)}-${bill.id}`)
  })

  it('rejects an invalid submission with field errors keyed by path', async () => {
    const values = validBill('MOCK-BAD-1')
    values.invoices[0].invoiceDate = '2026-09-02' // after the job date
    await assert.rejects(
      () => api.submitBill(values),
      (error: unknown) => {
        assert.ok(error instanceof SubmissionRejectedError)
        assert.match(error.fieldErrors['invoices.0.invoiceDate'], /after the job date/)
        return true
      }
    )
  })

  it('rejects references the server cannot find, and branches of the wrong party', async () => {
    const values = validBill('MOCK-BAD-2')
    values.exporterBranchId = '2003' // a consignee branch
    values.consigneeId = '99999'
    await assert.rejects(
      () => api.submitBill(values),
      (error: unknown) => {
        assert.ok(error instanceof SubmissionRejectedError)
        assert.match(error.fieldErrors.exporterBranchId, /does not belong/)
        assert.match(error.fieldErrors.consigneeId, /Unknown/)
        return true
      }
    )
  })

  it('enforces invoice number uniqueness across bills, but not against the bill itself', async () => {
    await assert.rejects(
      () => api.submitBill(validBill('EX/2081/2026')),
      (error: unknown) => {
        assert.ok(error instanceof SubmissionRejectedError)
        assert.match(error.fieldErrors['invoices.0.invoiceNumber'], /bill #3000/)
        return true
      }
    )
    const mine = await api.submitBill(validBill('MOCK-OWN-1'))
    await api.submitBill(validBill('MOCK-OWN-1'), mine.bill.id) // re-submitting the same bill is fine
  })

  it('keeps a submitted bill submitted when more work is saved on it', async () => {
    const { bill } = await api.submitBill(validBill('MOCK-KEEP-1'))
    assert.equal((await api.saveDraft(bill.values, bill.id)).status, 'submitted')
  })
})

describe('flat file', () => {
  it('generates a file for an existing bill and 404s for a missing one', async () => {
    const file = await api.getFlatFile(3000)
    assert.equal(file.filename, 'shipping_bill_2081.sb')
    assert.match(file.content, /^HREC/)
    await assert.rejects(() => api.getFlatFile(424242), { status: 404 })
  })
})

/// <reference types="node" />
import { InternalError } from 'core/utils'
import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { emptyBill } from '../../domain/defaults'
import { SubmissionRejectedError } from '../contract'
import { createHttpShippingBillApi } from './http-api'

// The adapter is tested against a fake `fetch`: what it requests, and how it maps responses to the
// `ShippingBillApi` contract. No server needed.

interface Call {
  url: string
  method: string
  body: unknown
}

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

function fakeServer(status: number, body: unknown) {
  const calls: Call[] = []
  globalThis.fetch = ((url: string, init: RequestInit) => {
    calls.push({ url, method: init.method ?? 'GET', body: init.body ? JSON.parse(init.body as string) : undefined })
    return Promise.resolve({ ok: status < 400, status, statusText: '', headers: {}, json: () => Promise.resolve(body) })
  }) as unknown as typeof fetch
  return calls
}

const api = createHttpShippingBillApi('https://api.test')

describe('http adapter', () => {
  it('sends searches as query parameters', async () => {
    const calls = fakeServer(200, [])
    await api.searchPorts('loading', 'mun')
    await api.searchBusinesses('buyer', 'gulf')
    assert.equal(calls[0].url, 'https://api.test/ports?kind=loading&q=mun')
    assert.equal(calls[1].url, 'https://api.test/businesses?role=buyer&q=gulf')
  })

  it('uses the owner kind in branch URLs, and POST vs PUT depending on an id', async () => {
    const calls = fakeServer(200, {})
    const branch = { branchName: 'HQ', address1: 'x', city: 'y', countryCode: 'IN' }
    await api.searchBranches('exporter', '10', '')
    await api.saveBranch('business', 5, branch)
    await api.saveBranch('business', 5, { ...branch, id: 9 })
    assert.equal(calls[0].url, 'https://api.test/exporters/10/branches?q=')
    assert.deepEqual([calls[1].method, calls[1].url], ['POST', 'https://api.test/businesses/5/branches'])
    assert.deepEqual([calls[2].method, calls[2].url], ['PUT', 'https://api.test/businesses/5/branches/9'])
  })

  it('turns a 404 on a read into undefined, but still throws other failures', async () => {
    fakeServer(404, { message: 'gone' })
    assert.equal(await api.getBill(1), undefined)
    assert.equal(await api.getExporter('1'), undefined)

    fakeServer(500, { message: 'boom' })
    await assert.rejects(() => api.getBill(1), { status: 500 })
  })

  it('creates a draft with POST and updates it with PUT, sending the form values', async () => {
    const calls = fakeServer(200, { id: 1 })
    await api.saveDraft(emptyBill())
    await api.saveDraft(emptyBill(), 7)
    assert.deepEqual([calls[0].method, calls[0].url], ['POST', 'https://api.test/shipping-bills'])
    assert.deepEqual([calls[1].method, calls[1].url], ['PUT', 'https://api.test/shipping-bills/7'])
    assert.ok((calls[0].body as { values: unknown }).values)
  })

  it('submits the form values together with the wire payload', async () => {
    const calls = fakeServer(200, { referenceNumber: 'SB-1' })
    await api.submitBill({ ...emptyBill(), exporterId: '1000' }, 3)
    assert.equal(calls[0].url, 'https://api.test/shipping-bills/3/submit')
    const body = calls[0].body as { values: { exporterId: string }; payload: { shipping_bill: { exporter: number } } }
    assert.equal(body.values.exporterId, '1000')
    assert.equal(body.payload.shipping_bill.exporter, 1000)
  })

  it('maps a 422 to SubmissionRejectedError with the field errors', async () => {
    fakeServer(422, { message: 'Invalid', description: JSON.stringify({ 'invoices.0.invoiceNumber': 'Taken' }) })
    await assert.rejects(
      () => api.submitBill(emptyBill()),
      (error: unknown) => {
        assert.ok(error instanceof SubmissionRejectedError)
        assert.deepEqual(error.fieldErrors, { 'invoices.0.invoiceNumber': 'Taken' })
        return true
      }
    )
  })

  it('still reports something when a 422 has no usable field errors', async () => {
    fakeServer(422, { message: 'Invalid bill', description: 'not json' })
    await assert.rejects(
      () => api.submitBill(emptyBill()),
      (error: unknown) => {
        assert.ok(error instanceof SubmissionRejectedError)
        assert.deepEqual(error.fieldErrors, { _: 'Invalid bill' })
        return true
      }
    )
  })

  it('lets other submit failures through untouched so the form can retry', async () => {
    fakeServer(503, { message: 'down' })
    await assert.rejects(
      () => api.submitBill(emptyBill()),
      (error: unknown) => error instanceof InternalError && error.status === 503
    )
  })
})

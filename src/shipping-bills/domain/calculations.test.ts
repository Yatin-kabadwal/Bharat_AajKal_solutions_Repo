/// <reference types="node" />
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { chargeAmount, invoiceTotal, itemsTotal, lineTotal, parseNumber, sameAmount } from './calculations'
import { emptyInvoice, emptyItem } from './defaults'

function item(quantity: string, unitPrice: string, lineTotalOverride = '') {
  return { ...emptyItem(), quantity, unitPrice, lineTotal: lineTotalOverride }
}

describe('parseNumber', () => {
  it('treats blank and non-numeric input as undefined, never NaN', () => {
    assert.equal(parseNumber(''), undefined)
    assert.equal(parseNumber('   '), undefined)
    assert.equal(parseNumber('abc'), undefined)
    assert.equal(parseNumber(undefined), undefined)
  })

  it('parses numbers, including zero', () => {
    assert.equal(parseNumber('12.5'), 12.5)
    assert.equal(parseNumber('0'), 0)
    assert.equal(parseNumber(7), 7)
  })
})

describe('lineTotal', () => {
  it('multiplies quantity by unit price', () => {
    assert.equal(lineTotal(item('4', '2.5')), 10)
  })

  it('is zero while the inputs are still empty', () => {
    assert.equal(lineTotal(item('', '')), 0)
  })

  it('prefers a manual override, even a zero one', () => {
    assert.equal(lineTotal(item('4', '2.5', '9')), 9)
    assert.equal(lineTotal(item('4', '2.5', '0')), 0)
  })
})

describe('invoice totals', () => {
  const invoice = { ...emptyInvoice(), items: [item('2', '10'), item('1', '5.5')] }

  it('sums the items', () => {
    assert.equal(itemsTotal(invoice), 25.5)
    assert.equal(invoiceTotal(invoice), 25.5)
  })

  it('uses the declared total when there is one', () => {
    assert.equal(invoiceTotal({ ...invoice, invoiceTotal: '30' }), 30)
    assert.equal(itemsTotal({ ...invoice, invoiceTotal: '30' }), 25.5)
  })

  it('computes a percentage charge from the items total', () => {
    assert.equal(chargeAmount({ ...invoice, discountRate: '10' }, 'discount'), 2.55)
  })

  it('prefers an absolute charge amount over a rate', () => {
    assert.equal(chargeAmount({ ...invoice, freightAmount: '3', freightRate: '50' }, 'freight'), 3)
    assert.equal(chargeAmount(invoice, 'freight'), 0)
  })
})

describe('sameAmount', () => {
  it('ignores differences below one cent', () => {
    assert.ok(sameAmount(10, 10.004))
    assert.ok(!sameAmount(10, 10.01))
  })
})

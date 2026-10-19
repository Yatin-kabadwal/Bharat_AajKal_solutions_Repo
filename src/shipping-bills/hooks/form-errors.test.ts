/// <reference types="node" />
import assert from 'node:assert/strict'
import { it } from 'node:test'
import { flattenErrorPaths } from './form-errors'

it('flattens react-hook-form errors into field paths', () => {
  const errors = {
    jobDate: { type: 'required', message: '' },
    invoices: [{ items: [undefined, { quantity: { type: 'validate', message: 'x' } }] }],
    containers: [{ containerNumber: { type: 'required', message: '' } }]
  }
  assert.deepEqual(flattenErrorPaths(errors), [
    'jobDate',
    'invoices.0.items.1.quantity',
    'containers.0.containerNumber'
  ])
})

it('returns nothing when there are no errors', () => {
  assert.deepEqual(flattenErrorPaths({}), [])
  assert.deepEqual(flattenErrorPaths(undefined), [])
})

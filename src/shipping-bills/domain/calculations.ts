import type { BillInvoiceForm, BillItemForm, ChargeKey } from './types'

/** Parses a form string. Blank or non-numeric input is `undefined`, never `NaN`. */
export function parseNumber(value: string | number | null | undefined): number | undefined {
  if (value == null || String(value).trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === ''
}

/** Item total: the manual override when present, otherwise quantity x unit price. */
export function lineTotal(item: BillItemForm): number {
  const override = parseNumber(item.lineTotal)
  if (override != null) return override
  return (parseNumber(item.quantity) ?? 0) * (parseNumber(item.unitPrice) ?? 0)
}

/** Sum of the item totals, ignoring any manual override on the invoice. */
export function itemsTotal(invoice: BillInvoiceForm): number {
  return invoice.items.reduce((sum, item) => sum + lineTotal(item), 0)
}

/** Invoice total: the manual override when present, otherwise the sum of the item totals. */
export function invoiceTotal(invoice: BillInvoiceForm): number {
  return parseNumber(invoice.invoiceTotal) ?? itemsTotal(invoice)
}

/** A charge is entered either as an absolute amount or as a % of the items total. */
export function chargeAmount(invoice: BillInvoiceForm, key: ChargeKey): number {
  const amount = parseNumber(invoice[`${key}Amount`])
  if (amount != null) return amount
  const rate = parseNumber(invoice[`${key}Rate`])
  return rate == null ? 0 : (itemsTotal(invoice) * rate) / 100
}

/** Two money values are equal when they differ by less than one minor unit. */
export function sameAmount(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005
}

export function formatAmount(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

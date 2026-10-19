import { parseNumber } from '../../domain/calculations'
import type { ChargeKey } from '../../domain/types'
import { useFormOptions } from '../../hooks/form-options-context'
import { useBillForm, useBillWatch } from '../../hooks/use-bill-form-context'
import { BillSelect } from './bill-select'
import { NumberInput } from './number-input'

/**
 * One invoice charge (freight, insurance, ...). It is entered either as a % rate or as an amount:
 * typing in one disables the other. Validation of the combination lives in `domain/validation.ts`.
 */
export function ChargeRow({ invoiceIndex, charge, label }: { invoiceIndex: number; charge: ChargeKey; label: string }) {
  const { register } = useBillForm()
  const { currencies } = useFormOptions()
  const at = `invoices.${invoiceIndex}` as const
  const rate = useBillWatch(`${at}.${charge}Rate`)
  const amount = useBillWatch(`${at}.${charge}Amount`)
  const invoiceCurrency = useBillWatch(`${at}.currency`)

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 lg:flex-nowrap">
      <span className="w-28 shrink-0 font-medium text-gray-900">{label}</span>
      <div className="flex items-center gap-1">
        <NumberInput
          {...register(`${at}.${charge}Rate`)}
          className="text-right"
          disabled={parseNumber(amount) != null}
          placeholder="Rate"
          aria-label={`${label} rate`}
        />
        <span className="text-xs text-gray-500">%</span>
      </div>
      <NumberInput
        {...register(`${at}.${charge}Amount`)}
        className="py-1 text-right"
        disabled={parseNumber(rate) != null}
        placeholder="Amount"
        aria-label={`${label} amount`}
      />
      <BillSelect name={`${at}.${charge}Currency`} options={currencies} placeholder={invoiceCurrency} />
    </div>
  )
}

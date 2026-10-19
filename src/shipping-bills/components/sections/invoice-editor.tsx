import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { formatAmount, invoiceTotal } from '../../domain/calculations'
import { emptyItem } from '../../domain/defaults'
import { chargeKeys, type ChargeKey } from '../../domain/types'
import { useFormOptions } from '../../hooks/form-options-context'
import { useBillForm, useBillWatch } from '../../hooks/use-bill-form-context'
import { BillSelect } from '../fields/bill-select'
import { ChargeRow } from '../fields/charge-row'
import { DateInput } from '../fields/date-input'
import { SectionHeading } from '../fields/form-layout'
import { NumberInput } from '../fields/number-input'
import { PartyPicker } from '../fields/party-picker'
import { ItemEditor } from './item-editor'

const chargeLabels: Record<ChargeKey, string> = {
  freight: 'Freight',
  insurance: 'Insurance',
  commission: 'Commission',
  discount: 'Discount',
  otherDeductions: 'Other deductions'
}

interface InvoiceEditorProps {
  index: number
  /** Present only when the bill has more than one invoice. */
  onRemove?: () => void
}

export function InvoiceEditor({ index, onRemove }: InvoiceEditorProps) {
  const { register, control } = useBillForm()
  const { currencies, contractTypes, paymentTypes, priceInclusionTypes } = useFormOptions()
  const at = `invoices.${index}` as const
  const { fields: items, append, remove } = useFieldArray({ control, name: `${at}.items` })
  const buyerSameAsConsignee = useBillWatch(`${at}.buyerSameAsConsignee`)

  return (
    <Card className="mb-4">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <h3 className="font-semibold">Invoice {index + 1}</h3>
        {onRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            Remove invoice
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Invoice number" {...register(`${at}.invoiceNumber`)} />
          <DateInput label="Invoice date" {...register(`${at}.invoiceDate`)} />
          <div className="flex gap-2">
            <div className="w-[100px] shrink-0">
              <BillSelect label="Currency" name={`${at}.currency`} options={currencies} rules={{ required: true }} />
            </div>
            <div className="flex-1">
              <NumberInput label="Total" min={0} placeholder="Sum of items" {...register(`${at}.invoiceTotal`)} />
            </div>
          </div>
          <BillSelect label="Contract" name={`${at}.contractType`} options={contractTypes} rules={{ required: true }} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox {...register(`${at}.buyerSameAsConsignee`)} />
          Buyer & consignee are same
        </label>
        {!buyerSameAsConsignee && (
          <PartyPicker
            kind="business"
            role="buyer"
            label="Buyer"
            ownerName={`${at}.buyerId`}
            branchName={`${at}.buyerBranchId`}
          />
        )}

        <div className="space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {/* Two charges per row on wide screens. */}
            {[chargeKeys.slice(0, 2), chargeKeys.slice(2, 4), chargeKeys.slice(4)].map((pair) => (
              <div
                key={pair[0]}
                className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                {pair.map((charge) => (
                  <ChargeRow key={charge} invoiceIndex={index} charge={charge} label={chargeLabels[charge]} />
                ))}
                {pair.length === 1 && (
                  <div className="flex flex-wrap items-center gap-2 p-2 lg:flex-nowrap">
                    <span className="w-28 shrink-0 font-medium text-gray-900">Packing charges</span>
                    <NumberInput
                      {...register(`${at}.packingCharges`)}
                      className="py-1 text-right"
                      placeholder="Amount"
                      aria-label="Packing charges"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <BillSelect
              label="Price includes"
              name={`${at}.freightInsuranceIncluded`}
              options={priceInclusionTypes}
              placeholder="Select if applicable"
            />
            <Input label="Contract / order number" {...register(`${at}.contractNumber`)} />
            <BillSelect
              label="Payment type"
              name={`${at}.natureOfPayment`}
              options={paymentTypes}
              placeholder="Select if applicable"
            />
            <NumberInput label="Payment period (days)" {...register(`${at}.periodOfPayment`)} />
          </div>
          <PartyPicker
            kind="business"
            role="thirdParty"
            label="Third party (optional)"
            ownerName={`${at}.thirdPartyId`}
            branchName={`${at}.thirdPartyBranchId`}
            required={false}
          />
        </div>

        <div className="border-t border-gray-200 pt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SectionHeading title="Goods" />
            <Button size="sm" variant="outline" onClick={() => append(emptyItem())}>
              + Add item
            </Button>
          </div>
          <div className="space-y-4">
            {items.map((field, itemIndex) => (
              <ItemEditor
                key={field.id}
                invoiceIndex={index}
                itemIndex={itemIndex}
                onRemove={items.length > 1 ? () => remove(itemIndex) : undefined}
              />
            ))}
          </div>
        </div>

        <InvoiceTotal index={index} />
      </CardContent>
    </Card>
  )
}

function InvoiceTotal({ index }: { index: number }) {
  const invoice = useBillWatch(`invoices.${index}`)
  return (
    <div className="text-right text-sm font-semibold">
      Invoice total: {invoice.currency} {formatAmount(invoiceTotal(invoice))}
    </div>
  )
}

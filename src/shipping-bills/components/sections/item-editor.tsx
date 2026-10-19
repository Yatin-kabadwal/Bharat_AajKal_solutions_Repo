import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { formatAmount, lineTotal } from '../../domain/calculations'
import { useFormOptions } from '../../hooks/form-options-context'
import { useBillForm, useBillWatch } from '../../hooks/use-bill-form-context'
import { BillSelect } from '../fields/bill-select'
import { DateInput } from '../fields/date-input'
import { Advanced, RepeatedBlock } from '../fields/form-layout'
import { NumberInput } from '../fields/number-input'
import { PartyPicker } from '../fields/party-picker'

interface ItemEditorProps {
  invoiceIndex: number
  itemIndex: number
  /** Present only when the invoice has more than one item. */
  onRemove?: () => void
}

/** One line of goods on an invoice. */
export function ItemEditor({ invoiceIndex, itemIndex, onRemove }: ItemEditorProps) {
  const { register } = useBillForm()
  const { schemeCodes, quantityCodes, tradeAgreements, igstPaymentStatuses, accessoryStatuses } = useFormOptions()
  const at = `invoices.${invoiceIndex}.items.${itemIndex}` as const

  const currency = useBillWatch(`invoices.${invoiceIndex}.currency`)
  const item = useBillWatch(at)
  const unitOfMeasurement = item.unitOfMeasurement

  // Some schemes unlock the drawback inputs.
  const scheme = schemeCodes.find((option) => option.value === item.schemeCode)
  const showDrawback = scheme != null && (scheme.drawback || scheme.RODTEP || scheme.ROSCTL)

  return (
    <RepeatedBlock title={`Item ${itemIndex + 1}`} onRemove={onRemove}>
      <div className="mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Input label="RITC / HS code" {...register(`${at}.ritcCode`)} placeholder="e.g. 61091000" />
        <BillSelect label="Scheme code" name={`${at}.schemeCode`} options={schemeCodes} placeholder="Select scheme" />
        <Input
          label="Goods description"
          {...register(`${at}.goodsDescription1`)}
          wrapClass="lg:col-span-4"
          placeholder="e.g. Cotton T-shirts"
        />
        <NumberInput label="Quantity" {...register(`${at}.quantity`)} />
        <BillSelect label="Unit" name={`${at}.unitOfMeasurement`} options={quantityCodes} rules={{ required: true }} />
        <NumberInput label={`Unit price (${currency || 'currency'})`} {...register(`${at}.unitPrice`)} />
        <NumberInput
          label="Item total"
          placeholder={`${currency} ${formatAmount(lineTotal(item))}`}
          {...register(`${at}.lineTotal`)}
        />
        <BillSelect
          label="IGST payment"
          name={`${at}.igstPaymentStatus`}
          options={igstPaymentStatuses}
          placeholder="Select if applicable"
        />
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-4">
        {showDrawback && (
          <>
            <Input label="Drawback serial no." wrapClass="w-36" {...register(`${at}.drawbackSerialNumber`)} />
            <Input label="Drawback unit" wrapClass="w-32" {...register(`${at}.drawbackUnit`)} />
            <NumberInput label="Drawback quantity" wrapClass="w-36" {...register(`${at}.drawbackQuantity`)} />
          </>
        )}
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`${at}.rewardItem`)} />
          Claim reward
        </label>
        <label className="flex items-center gap-2 pb-1 text-sm">
          <Checkbox {...register(`${at}.thirdPartyItem`)} />
          Third-party item
        </label>
      </div>

      {item.thirdPartyItem && (
        <div className="my-4">
          <PartyPicker
            kind="business"
            role="thirdParty"
            label="Item third party"
            ownerName={`${at}.itemThirdPartyId`}
            branchName={`${at}.itemThirdPartyBranchId`}
          />
        </div>
      )}

      <Advanced
        title="Item customs, taxes and incentives"
        openOnError={[`${at}.taxableValue`, `${at}.igstAmount`, `${at}.ar4Number`, `${at}.ar4Date`]}>
        <div className="mb-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BillSelect
            label="Unit of rate"
            name={`${at}.unitOfRate`}
            options={quantityCodes}
            placeholder={unitOfMeasurement}
          />
          <NumberInput label="Per unit (rate)" placeholder="1" {...register(`${at}.numberOfUnits`)} />
          <NumberInput label="Present market value" {...register(`${at}.presentMarketValue`)} />
          <NumberInput label="GCess" {...register(`${at}.cess`)} />
          <Input
            label="Accessories description"
            wrapClass="lg:col-span-3"
            {...register(`${at}.accessoriesDescription`)}
          />
          <BillSelect
            label="Accessory status"
            name={`${at}.accessoryStatus`}
            options={accessoryStatuses}
            placeholder="Select if relevant"
          />
          {item.igstPaymentStatus === 'P' && (
            <>
              <NumberInput label="Taxable value" {...register(`${at}.taxableValue`)} />
              <NumberInput label="IGST amount" {...register(`${at}.igstAmount`)} />
            </>
          )}
          <Input label="Origin district code" {...register(`${at}.originDistrictCode`)} />
          <BillSelect
            label="Trade agreement code"
            name={`${at}.tradeAgreementsCode`}
            options={tradeAgreements}
            placeholder="NCPTI"
          />
          <Input label="End use code" {...register(`${at}.endUseOfItem`)} />
          <NumberInput label="Packages for item" {...register(`${at}.totalPackage`)} />
        </div>
        <Advanced title="AR4 / excise details" openOnError={[`${at}.ar4Number`, `${at}.ar4Date`]}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="AR4 number" {...register(`${at}.ar4Number`)} />
            <DateInput label="AR4 date" {...register(`${at}.ar4Date`)} />
          </div>
        </Advanced>
      </Advanced>
    </RepeatedBlock>
  )
}

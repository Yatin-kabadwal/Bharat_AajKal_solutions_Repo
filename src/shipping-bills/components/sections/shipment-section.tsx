import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { portCountry } from '../../domain/ports'
import { useFormOptions } from '../../hooks/form-options-context'
import { portLookup } from '../../hooks/lookups'
import { useMarksAndNumbersQuery } from '../../hooks/queries'
import { useBillForm, useBillWatch } from '../../hooks/use-bill-form-context'
import { BillSelect } from '../fields/bill-select'
import { DateInput } from '../fields/date-input'
import { Advanced, SectionHeading } from '../fields/form-layout'
import { NumberInput } from '../fields/number-input'
import { PartyPicker } from '../fields/party-picker'
import { RemoteSelect } from '../fields/remote-select'

/** Tab 1: parties, route and package details. */
export function ShipmentSection() {
  const { setValue } = useBillForm()

  return (
    <Card>
      <CardHeader title="Shipment basics" description="Parties and route are the core details for this bill." />
      <CardContent className="space-y-5">
        <PartyPicker
          kind="exporter"
          label="Exporter"
          ownerName="exporterId"
          branchName="exporterBranchId"
          // Marks and numbers belong to an exporter: clear the choice when the exporter changes.
          onOwnerChange={() => setValue('marksAndNumbers', '')}
        />
        <PartyPicker
          kind="business"
          role="consignee"
          label="Consignee"
          ownerName="consigneeId"
          branchName="consigneeBranchId"
        />
        <RouteBlock />
        <PackageBlock />
      </CardContent>
    </Card>
  )
}

function RouteBlock() {
  const { register } = useBillForm()
  const { states, nfeiCategories } = useFormOptions()
  const loadingPort = useBillWatch('loadingPort')
  const destinationPort = useBillWatch('finalDestinationPort')

  return (
    <>
      <div className="border-t border-gray-200 pt-5">
        <SectionHeading title="Route" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-medium">Port of loading</span>
            <RemoteSelect name="loadingPort" lookup={portLookup('loading')} placeholder="Select Indian port" required />
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium">Final destination port</span>
            <RemoteSelect
              name="finalDestinationPort"
              lookup={portLookup('destination')}
              placeholder="Select destination"
              required
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Countries are derived from the port codes when saved: {portCountry(loadingPort) || '—'} →{' '}
          {portCountry(destinationPort) || '—'}.
        </p>
      </div>
      <Advanced title="Regulatory and route exceptions" openOnError={['rbiWaiverNumber', 'rbiWaiverDate']}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="mb-1 block text-sm font-medium">Discharge port</span>
            <RemoteSelect
              name="dischargePort"
              lookup={portLookup('destination')}
              placeholder="Defaults to destination"
            />
          </div>
          <BillSelect
            label="Origin state"
            name="originStateCode"
            options={states}
            placeholder="Defaults to Branch State Code"
          />
          <BillSelect label="NFEI category" name="nfeiCategory" options={nfeiCategories} placeholder="Not applicable" />
          <Input label="RBI waiver number" {...register('rbiWaiverNumber')} />
          <DateInput label="RBI waiver date" {...register('rbiWaiverDate')} />
        </div>
      </Advanced>
    </>
  )
}

function PackageBlock() {
  const { register } = useBillForm()
  const { cargoTypes, weightUnits, sealTypes } = useFormOptions()
  const exporterId = useBillWatch('exporterId')
  const containers = useBillWatch('containers')
  const marks = useMarksAndNumbersQuery(exporterId)

  const marksPlaceholder = !exporterId
    ? 'Select exporter first'
    : marks.isPending
      ? 'Loading marks and numbers...'
      : marks.isError
        ? 'Could not load marks and numbers'
        : marks.data.length === 0
          ? 'No saved marks for this exporter'
          : 'Select marks and numbers'

  return (
    <div className="border-t border-gray-200 pt-5">
      <SectionHeading title="Package Detail" />
      <div className="grid gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-4">
        <BillSelect label="Nature of cargo" name="natureOfCargo" options={cargoTypes} />
        <NumberInput label="Gross weight" {...register('grossWeight')} />
        <NumberInput label="Net weight" {...register('netWeight')} />
        <BillSelect label="Weight unit" name="measurementUnit" options={weightUnits} />
        <NumberInput label="Total packages" {...register('totalPackages')} />
        <BillSelect
          label="Marks and numbers"
          name="marksAndNumbers"
          options={marks.data ?? []}
          placeholder={marksPlaceholder}
          disabled={!marks.data?.length}
          wrapClass="sm:col-span-3"
        />
      </div>
      {marks.isError && (
        <p className="mb-3 text-xs text-red-600">
          Marks and numbers could not be loaded.{' '}
          <button type="button" className="font-medium underline" onClick={() => marks.refetch()}>
            Try again
          </button>
        </p>
      )}
      <Advanced title="Additional Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BillSelect label="Seal type" name="sealType" options={sealTypes} placeholder="Select if relevant" />
          {containers.length === 0 && <NumberInput label="Number of containers" {...register('numberOfContainers')} />}
          <NumberInput label="Loose packets" {...register('loosePackets')} />
          <Input label="MAWB number" {...register('mawbNumber')} />
          <Input label="HAWB number" {...register('hawbNumber')} />
        </div>
      </Advanced>
    </div>
  )
}

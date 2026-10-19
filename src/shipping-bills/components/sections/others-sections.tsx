import { useFieldArray } from 'core/form'
import { Button } from 'ui/basic/button'
import { Card, CardContent, CardHeader } from 'ui/basic/card'
import { Input } from 'ui/inputs/input'
import { emptyContainer, emptyDocument, emptyLicense, emptyPackingRange } from '../../domain/defaults'
import { useFormOptions } from '../../hooks/form-options-context'
import { documentTypeLookup } from '../../hooks/lookups'
import { useBillForm } from '../../hooks/use-bill-form-context'
import { BillSelect } from '../fields/bill-select'
import { DateInput } from '../fields/date-input'
import { Advanced, RepeatedBlock, SectionHeading } from '../fields/form-layout'
import { NumberInput } from '../fields/number-input'
import { RemoteSelect } from '../fields/remote-select'

// Tab 3: containers, packing list, supporting documents and licences. Each group is a list the
// user adds to and removes from, so each one is a small component around `useFieldArray`.

/** Header with a title, a hint and the "+ Add" button every list on this tab has. */
function ListCardHeader({
  title,
  description,
  addLabel,
  onAdd
}: {
  title: string
  description: string
  addLabel: string
  onAdd: () => void
}) {
  return (
    <CardHeader className="flex-row items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-gray-950">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>
    </CardHeader>
  )
}

export function CargoSection() {
  return (
    <Card>
      <CardHeader title="Cargo & Package Detail" />
      <CardContent className="space-y-5">
        <ContainerList />
        <PackingList />
      </CardContent>
    </Card>
  )
}

function ContainerList() {
  const { register, control } = useBillForm()
  const { containerSizes, containerSealTypes } = useFormOptions()
  const { fields, append, remove } = useFieldArray({ control, name: 'containers' })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionHeading
          title={`Containers (${fields.length})`}
          description="Add only when the cargo is containerized."
        />
        <Button size="sm" variant="outline" onClick={() => append(emptyContainer())}>
          + Add container
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const at = `containers.${index}` as const
          return (
            <RepeatedBlock key={field.id} title={`Container ${index + 1}`} onRemove={() => remove(index)}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Container number" placeholder="MSCU1234567" {...register(`${at}.containerNumber`)} />
                <BillSelect
                  label="Size"
                  name={`${at}.containerSize`}
                  options={containerSizes}
                  placeholder="Select size"
                />
                <Input label="Seal number" {...register(`${at}.exciseSealNumber`)} />
                <DateInput label="Seal date" {...register(`${at}.sealDate`)} />
                <BillSelect
                  label="Seal type"
                  name={`${at}.sealType`}
                  options={containerSealTypes}
                  placeholder="Select if needed"
                />
                <Input label="Seal device ID" {...register(`${at}.sealDeviceId`)} />
                <Input label="Movement document type" {...register(`${at}.movementDocumentType`)} />
                <Input label="Movement document number" {...register(`${at}.movementDocumentNumber`)} />
              </div>
            </RepeatedBlock>
          )
        })}
      </div>
    </div>
  )
}

function PackingList() {
  const { register, control } = useBillForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'packingRanges' })

  return (
    <Advanced
      title={`Packing list ranges (${fields.length})`}
      defaultOpen={fields.length > 0}
      openOnError={fields.flatMap((_, i) => [
        `packingRanges.${i}.packingNumberFrom`,
        `packingRanges.${i}.packingNumberTo`
      ])}>
      <div className="space-y-3">
        <Button variant="outline" size="sm" onClick={() => append(emptyPackingRange())}>
          + Add packing range
        </Button>
        {fields.map((field, index) => (
          <RepeatedBlock
            key={field.id}
            title={`Range ${index + 1}`}
            onRemove={() => remove(index)}
            className="rounded-lg border border-gray-200 p-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <NumberInput label="Package from" {...register(`packingRanges.${index}.packingNumberFrom`)} />
              <NumberInput label="Package to" {...register(`packingRanges.${index}.packingNumberTo`)} />
              <Input label="Packing code" {...register(`packingRanges.${index}.packingCode`)} />
            </div>
          </RepeatedBlock>
        ))}
      </div>
    </Advanced>
  )
}

export function DocumentsSection() {
  const { control } = useBillForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'documents' })

  return (
    <Card>
      <ListCardHeader
        title="Supporting documents"
        description="Add references when required for this shipment."
        addLabel="+ Add document"
        onAdd={() => append(emptyDocument())}
      />
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <DocumentItem key={field.id} index={index} onRemove={() => remove(index)} />
        ))}
      </CardContent>
    </Card>
  )
}

function DocumentItem({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { register, getValues } = useBillForm()
  const { documentFileTypes } = useFormOptions()
  const at = `documents.${index}` as const

  // Open the optional block when it already holds data (an existing bill being edited).
  const {
    documentExpiryDate,
    invoiceSerialNumber,
    itemSerialNumber,
    placeOfIssue,
    fileType,
    icegateId,
    issuingPartyName,
    beneficiaryPartyName
  } = getValues(at)
  const hasOptionalData = [
    documentExpiryDate,
    invoiceSerialNumber,
    itemSerialNumber,
    placeOfIssue,
    fileType,
    icegateId,
    issuingPartyName,
    beneficiaryPartyName
  ].some(Boolean)

  return (
    <RepeatedBlock
      title={`Document ${index + 1}`}
      onRemove={onRemove}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RemoteSelect
          label="Document type code"
          name={`${at}.documentTypeCode`}
          lookup={documentTypeLookup()}
          placeholder="Search document type..."
          required
        />
        <Input label="Reference number" {...register(`${at}.documentReferenceNumber`)} />
        <Input label="Image reference number" {...register(`${at}.imageReferenceNumber`)} />
        <DateInput label="Issue date" {...register(`${at}.documentIssueDate`)} />
      </div>
      <Advanced
        title="Issuing party and ICEGATE details"
        defaultOpen={hasOptionalData}
        openOnError={[`${at}.documentExpiryDate`, `${at}.invoiceSerialNumber`, `${at}.itemSerialNumber`]}>
        <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DateInput label="Expiry date" {...register(`${at}.documentExpiryDate`)} />
          <NumberInput label="Invoice serial number" {...register(`${at}.invoiceSerialNumber`)} />
          <NumberInput label="Item serial number" {...register(`${at}.itemSerialNumber`)} />
          <BillSelect
            label="File type"
            name={`${at}.fileType`}
            options={documentFileTypes}
            placeholder="Select file type"
          />
          <Input label="Place of issue" {...register(`${at}.placeOfIssue`)} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <PartyDetails at={at} prefix="issuingParty" title="Issuing details" labelPrefix="Issuing" />
          <PartyDetails at={at} prefix="beneficiaryParty" title="Beneficiary details" labelPrefix="Beneficiary" />
        </div>
      </Advanced>
    </RepeatedBlock>
  )
}

/** The issuing and beneficiary blocks have identical fields under different names. */
function PartyDetails({
  at,
  prefix,
  title,
  labelPrefix
}: {
  at: `documents.${number}`
  prefix: 'issuingParty' | 'beneficiaryParty'
  title: string
  labelPrefix: string
}) {
  const { register } = useBillForm()

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-900">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={`${labelPrefix} party code`} {...register(`${at}.${prefix}Code`)} />
        <Input label={`${labelPrefix} party name`} {...register(`${at}.${prefix}Name`)} />
        <Input label={`${labelPrefix} address line 1`} {...register(`${at}.${prefix}Address1`)} />
        <Input label={`${labelPrefix} address line 2`} {...register(`${at}.${prefix}Address2`)} />
        <Input label={`${labelPrefix} city`} {...register(`${at}.${prefix}City`)} />
        <Input label={`${labelPrefix} postal code`} {...register(`${at}.${prefix}Pin`)} />
      </div>
    </div>
  )
}

export function LicensesSection() {
  const { register, control } = useBillForm()
  const { licenseSources } = useFormOptions()
  const { fields, append, remove } = useFieldArray({ control, name: 'licenses' })

  return (
    <Card>
      <ListCardHeader
        title="Licences"
        description="Only enter these for schemes that require a licence."
        addLabel="+ Add licence"
        onAdd={() => append(emptyLicense())}
      />
      <CardContent className="space-y-4">
        {fields.map((field, index) => {
          const at = `licenses.${index}` as const
          return (
            <RepeatedBlock key={field.id} title={`Licence ${index + 1}`} onRemove={() => remove(index)}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Registration number" {...register(`${at}.registrationNumber`)} />
                <DateInput label="Registration date" {...register(`${at}.registrationDate`)} />
                <NumberInput label="Invoice serial number" {...register(`${at}.invoiceSerialNumber`)} />
                <NumberInput label="Item serial number" {...register(`${at}.itemSerialNumber`)} />
                <NumberInput label="Licence serial number" {...register(`${at}.licenseSerialNumber`)} />
                <Input label="Item serial, Part E" {...register(`${at}.itemSerialNumberPartE`)} />
                <Input label="Item serial, Part C" {...register(`${at}.itemSerialNumberPartC`)} />
                <NumberInput label="Licence quantity" {...register(`${at}.licenseQuantity`)} />
                <NumberInput label="Export quantity" {...register(`${at}.licenseExportQuantity`)} />
                <BillSelect
                  label="Goods source"
                  name={`${at}.indigenousOrImported`}
                  options={licenseSources}
                  placeholder="Select if needed"
                />
              </div>
            </RepeatedBlock>
          )
        })}
      </CardContent>
    </Card>
  )
}

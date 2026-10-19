import { InferType, useForm } from 'core/form'
import { Form, SubmitButton } from 'core/form/components'
import { toast } from 'core/toast-manager'
import { Button } from 'ui/basic/button'
import { Checkbox } from 'ui/inputs/checkbox'
import { Input } from 'ui/inputs/input'
import { Select } from 'ui/inputs/select'
import { Textarea } from 'ui/inputs/text-area'
import { Dialog, DialogContent } from 'ui/interactive/dialog'
import type { Branch, Business, BusinessRole, Exporter, PartyKind } from '../domain/types'
import { saveBranch, saveBusiness, saveExporter } from '../hooks/actions'
import { useFormOptions } from '../hooks/form-options-context'
import { branchSchema, partySchema } from '../schema/party-schema'

type PartyFields = InferType<typeof partySchema>
type BranchFields = InferType<typeof branchSchema>

const dialogBody =
  'foreground max-h-[90vh] w-[min(92vw,42rem)] overflow-y-auto rounded-xl border border-gray-200 p-6 shadow-xl'

const businessRoles = [
  ['isConsignee', 'Consignee'],
  ['isBuyer', 'Buyer'],
  ['isNotify', 'Notify party'],
  ['isThirdParty', 'Third party']
] as const

function Footer({ onClose, submitLabel }: { onClose: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <SubmitButton>{submitLabel}</SubmitButton>
    </div>
  )
}

function partyDefaults(
  kind: PartyKind,
  party: Exporter | Business | undefined,
  role: BusinessRole | undefined
): PartyFields {
  const exporter = kind === 'exporter' ? (party as Exporter | undefined) : undefined
  const business = kind === 'business' ? (party as Business | undefined) : undefined

  return {
    name: party?.name ?? '',
    iec: party?.iec ?? '',
    class: exporter?.class ?? (kind === 'exporter' ? 'F' : undefined),
    type: exporter?.type ?? (kind === 'exporter' ? 'P' : undefined),
    pan: exporter?.pan ?? '',
    tan: exporter?.tan ?? '',
    aeoNumber: exporter?.aeoNumber ?? '',
    website: exporter?.website ?? '',
    notes: exporter?.notes ?? '',
    isConsignee: business?.isConsignee ?? role === 'consignee',
    isBuyer: business?.isBuyer ?? role === 'buyer',
    isNotify: business?.isNotify ?? false,
    isThirdParty: business?.isThirdParty ?? role === 'thirdParty',
    branchName: '',
    address1: '',
    city: '',
    countryCode: kind === 'exporter' ? 'IN' : ''
  }
}

interface PartyDialogProps {
  kind: PartyKind
  party?: Exporter | Business
  /** Pre-ticks the matching "used as" box when adding a business from a picker. */
  initialRole?: BusinessRole
  onClose: () => void
  onSaved?: (party: Exporter | Business) => void
}

export function PartyDialog({ kind, party, initialRole, onClose, onSaved }: PartyDialogProps) {
  const { exporterClasses, exporterTypes, countries } = useFormOptions()
  const isNew = party == null
  const formCtx = useForm<PartyFields>(partySchema, { defaultValues: partyDefaults(kind, party, initialRole) })
  const { register } = formCtx.hooks

  async function handleSave(values: PartyFields) {
    const firstBranch = isNew
      ? {
          branchName: values.branchName!,
          address1: values.address1!,
          city: values.city!,
          state: values.state,
          pincode: values.pincode,
          countryCode: values.countryCode
        }
      : undefined
    const name = values.name.trim()

    const saved =
      kind === 'exporter'
        ? await saveExporter({
            id: party?.id,
            name,
            iec: values.iec?.trim() ?? '',
            class: values.class ?? 'F',
            type: values.type ?? 'P',
            pan: values.pan,
            tan: values.tan,
            aeoNumber: values.aeoNumber,
            website: values.website,
            notes: values.notes,
            firstBranch
          })
        : await saveBusiness({
            id: party?.id,
            name,
            iec: values.iec,
            isConsignee: !!values.isConsignee,
            isBuyer: !!values.isBuyer,
            isNotify: !!values.isNotify,
            isThirdParty: !!values.isThirdParty,
            firstBranch
          })

    toast.success(`${kind === 'exporter' ? 'Exporter' : 'Business'} saved`)
    onSaved?.(saved)
    onClose()
  }

  return (
    <Dialog open setOpen={(open) => !open && onClose()}>
      <DialogContent center>
        <div className={dialogBody}>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              {isNew ? 'Add' : 'Edit'} {kind}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isNew
                ? 'Add the main details and one address. You can add more branches later.'
                : 'Update the shared master record.'}
            </p>
          </div>
          <Form ctx={formCtx} handleSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" {...register('name')} wrapClass="sm:col-span-2" />
              <Input label="IEC" {...register('iec', { required: kind === 'exporter' })} />
              {kind === 'exporter' ? (
                <>
                  <Select<PartyFields> label="Exporter class" name="class" options={exporterClasses} />
                  <Select<PartyFields> label="Exporter type" name="type" options={exporterTypes} />
                </>
              ) : (
                <div className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-medium">Used as</span>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {businessRoles.map(([name, label]) => (
                      <label key={name} className="flex items-center gap-2">
                        <Checkbox {...register(name)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {kind === 'exporter' && (
              <details className="rounded-lg border border-gray-200 p-3">
                <summary className="cursor-pointer text-sm font-medium">More exporter details</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="PAN" {...register('pan')} />
                  <Input label="TAN" {...register('tan')} />
                  <Input label="AEO number" {...register('aeoNumber')} />
                  <Input label="Website" {...register('website')} />
                  <Textarea label="Notes" {...register('notes')} wrapClass="sm:col-span-2" />
                </div>
              </details>
            )}
            {isNew && (
              <section className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 font-medium">First branch</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Branch name" {...register('branchName', { required: true })} />
                  <Input label="Address line 1" {...register('address1', { required: true })} />
                  <Input label="City" {...register('city', { required: true })} />
                  <Select<PartyFields>
                    label="Country"
                    name="countryCode"
                    options={countries}
                    placeholder="Select country"
                  />
                  <Input label="State / province" {...register('state')} />
                  <Input label="Postal code" {...register('pincode')} />
                </div>
              </section>
            )}
            <Footer onClose={onClose} submitLabel={`Save ${kind}`} />
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface BranchDialogProps {
  kind: PartyKind
  ownerId: number
  branch?: Branch
  onClose: () => void
  onSaved?: (branch: Branch) => void
}

export function BranchDialog({ kind, ownerId, branch, onClose, onSaved }: BranchDialogProps) {
  const { countries } = useFormOptions()
  const formCtx = useForm<BranchFields>(branchSchema, {
    defaultValues: branch ?? { branchName: '', address1: '', city: '', countryCode: kind === 'exporter' ? 'IN' : '' }
  })
  const { register } = formCtx.hooks

  async function handleSave(values: BranchFields) {
    const saved = await saveBranch(kind, ownerId, { ...values, id: branch?.id })
    toast.success('Branch saved')
    onSaved?.(saved)
    onClose()
  }

  return (
    <Dialog open setOpen={(open) => !open && onClose()}>
      <DialogContent center>
        <div className={dialogBody}>
          <h2 className="mb-5 text-lg font-semibold">{branch ? 'Edit' : 'Add'} branch</h2>
          <Form ctx={formCtx} handleSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Branch name" {...register('branchName')} />
              <Input label="Address line 1" {...register('address1')} />
              <Input label="Address line 2" {...register('address2')} />
              <Input label="City" {...register('city')} />
              <Input label="State / province" {...register('state')} />
              <Input label="Postal code" {...register('pincode')} />
              <Select<BranchFields>
                label="Country"
                name="countryCode"
                options={countries}
                placeholder="Select country"
              />
              <Input label="Email" type="email" {...register('email')} />
              <Input label="Mobile" {...register('mobile')} />
              <Input label="GSTIN / tax ID" {...register('gstnId')} />
            </div>
            {kind === 'exporter' && (
              <details className="rounded-lg border border-gray-200 p-3">
                <summary className="cursor-pointer text-sm font-medium">Bank and customs details</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="AD code" {...register('adCode')} />
                  <Input label="Account number" {...register('accountNo')} />
                  <Input label="IFSC code" {...register('ifscCode')} />
                </div>
              </details>
            )}
            <Footer onClose={onClose} submitLabel="Save branch" />
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

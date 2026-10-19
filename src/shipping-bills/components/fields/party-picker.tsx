import { Path } from 'ui/form'
import type { BusinessRole, PartyKind, ShippingBillFormValues } from '../../domain/types'
import { branchLookup, businessLookup, exporterLookup } from '../../hooks/lookups'
import { usePartyActions } from '../../hooks/party-actions-context'
import { useBillForm, useBillWatch } from '../../hooks/use-bill-form-context'
import { RemoteSelect } from './remote-select'

interface PartyPickerProps {
  kind: PartyKind
  /** Which business role to search for. Ignored for exporters. */
  role?: BusinessRole
  label: string
  ownerName: Path<ShippingBillFormValues>
  branchName: Path<ShippingBillFormValues>
  required?: boolean
  /** Fires when the user picks a different party (not for the initial value). */
  onOwnerChange?: (ownerId: string) => void
}

const linkButton = 'text-primary-700 text-xs font-medium hover:underline'

/** A party (exporter, consignee, buyer...) and one of its branches, chosen as a pair. */
export function PartyPicker({
  kind,
  role,
  label,
  ownerName,
  branchName,
  required = true,
  onOwnerChange
}: PartyPickerProps) {
  const { setValue } = useBillForm()
  const { addParty, addBranch } = usePartyActions()
  const watchedOwner = useBillWatch(ownerName)
  const ownerId = typeof watchedOwner === 'string' ? watchedOwner : ''

  const ownerLookup = kind === 'exporter' ? exporterLookup() : businessLookup(role ?? 'consignee')

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{label}</span>
          <button
            type="button"
            className={linkButton}
            onClick={() => addParty({ kind, role, ownerPath: ownerName, branchPath: branchName })}>
            + Add new
          </button>
        </div>
        <RemoteSelect
          name={ownerName}
          lookup={ownerLookup}
          placeholder={`Search & select ${label.toLowerCase()}...`}
          required={required}
          // A branch belongs to one party, so changing the party clears the branch.
          onSelect={(next) => {
            if (next === ownerId) return
            setValue(branchName, '', { shouldValidate: false })
            onOwnerChange?.(next)
          }}
        />
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Branch / address</span>
          {ownerId && (
            <button
              type="button"
              className={linkButton}
              onClick={() => addBranch({ kind, ownerId: Number(ownerId), branchPath: branchName })}>
              + Add branch
            </button>
          )}
        </div>
        <RemoteSelect
          name={branchName}
          lookup={branchLookup(kind, ownerId)}
          placeholder={ownerId ? 'Search & select branch...' : `Choose ${label.toLowerCase()} first`}
          disabled={!ownerId}
          required={required || !!ownerId}
        />
      </div>
    </div>
  )
}

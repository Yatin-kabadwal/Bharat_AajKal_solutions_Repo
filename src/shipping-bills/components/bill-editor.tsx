import { routes } from '@/shared/route-paths'
import { useFieldArray } from 'core/form'
import { Form, SubmitButton } from 'core/form/components'
import { navigate } from 'core/routing'
import { useMemo, useState } from 'react'
import { Badge } from 'ui/basic/badge'
import { Button } from 'ui/basic/button'
import type { Path } from 'ui/form'
import { Tabs, TabsList, TabsTrigger } from 'ui/interactive/tabs'
import { emptyInvoice } from '../domain/defaults'
import { billTabs } from '../domain/form-tabs'
import type { Branch, Business, Exporter, SavedBill, ShippingBillFormValues } from '../domain/types'
import { PartyActions, PartyActionsContext, type BranchTarget, type PartyTarget } from '../hooks/party-actions-context'
import { useBillEditor } from '../hooks/use-bill-editor'
import { useBillForm } from '../hooks/use-bill-form-context'
import { PersistentTab } from './fields/form-layout'
import { BranchDialog, PartyDialog } from './party-dialogs'
import { InvoiceEditor } from './sections/invoice-editor'
import { CargoSection, DocumentsSection, LicensesSection } from './sections/others-sections'
import { ShipmentSection } from './sections/shipment-section'
import { WorkflowSteps } from './workflow-steps'

type BillPath = Path<ShippingBillFormValues>

/** The shipping bill form: header, tabs, footer, and the dialogs for adding parties on the fly. */
export function BillEditor({ bill }: { bill?: SavedBill }) {
  const editor = useBillEditor(bill)
  const { setValue } = editor.formCtx.hooks
  const [partyTarget, setPartyTarget] = useState<PartyTarget | null>(null)
  const [branchTarget, setBranchTarget] = useState<BranchTarget | null>(null)
  const partyActions = useMemo<PartyActions>(() => ({ addParty: setPartyTarget, addBranch: setBranchTarget }), [])

  // A newly created party arrives with one branch. Select both, as if the user had picked them.
  function selectNewParty(target: PartyTarget, party: Exporter | Business) {
    const branchId = party.branches.at(0)?.id
    if (branchId == null) return
    setValue(target.ownerPath as BillPath, String(party.id), { shouldValidate: true })
    setValue(target.branchPath as BillPath, String(branchId), { shouldValidate: true })
    if (target.kind === 'exporter') setValue('marksAndNumbers', '')
  }

  return (
    <PartyActionsContext.Provider value={partyActions}>
      <div className="space-y-5">
        <header>
          <button className="mb-2 text-sm text-gray-500 hover:underline" onClick={() => navigate(routes.dashboard)}>
            ← Shipping bills
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-950">
              {bill ? `Edit shipping bill #${bill.id}` : 'New shipping bill'}
            </h1>
            {bill && <Badge variant={bill.status === 'submitted' ? 'success' : 'secondary'}>{bill.status}</Badge>}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enter the everyday details first. Open advanced sections only when needed.
          </p>
        </header>

        <WorkflowSteps />

        <Form ctx={editor.formCtx} handleSubmit={editor.handleSubmit} className="space-y-5">
          <Tabs
            value={editor.activeTab}
            onValueChange={(value) => editor.setActiveTab(value as typeof editor.activeTab)}>
            <TabsList className="flex w-full justify-start overflow-x-auto">
              {billTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <PersistentTab active={editor.activeTab === 'details'}>
              <ShipmentSection />
            </PersistentTab>
            <PersistentTab active={editor.activeTab === 'invoices'}>
              <InvoicesSection />
            </PersistentTab>
            <PersistentTab active={editor.activeTab === 'documents'}>
              <CargoSection />
              <DocumentsSection />
              <LicensesSection />
            </PersistentTab>
          </Tabs>

          <div className="flex flex-wrap justify-between gap-2 border-t border-gray-200 pt-4">
            <Button variant="outline" onClick={() => navigate(routes.dashboard)}>
              Cancel
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" loading={editor.isSavingDraft} onClick={() => editor.saveDraft()}>
                Save draft
              </Button>
              {editor.previousTab && (
                <Button variant="outline" onClick={() => editor.setActiveTab(editor.previousTab!)}>
                  Previous
                </Button>
              )}
              {editor.nextTab ? (
                <Button loading={editor.isSavingDraft} onClick={() => editor.saveDraft(editor.nextTab)}>
                  Save & Next
                </Button>
              ) : (
                <SubmitButton>{bill?.status === 'submitted' ? 'Save changes' : 'Submit shipping bill'}</SubmitButton>
              )}
            </div>
          </div>
        </Form>

        {partyTarget && (
          <PartyDialog
            key={partyTarget.ownerPath}
            kind={partyTarget.kind}
            initialRole={partyTarget.role}
            onClose={() => setPartyTarget(null)}
            onSaved={(party) => selectNewParty(partyTarget, party)}
          />
        )}
        {branchTarget && (
          <BranchDialog
            key={`${branchTarget.kind}-${branchTarget.ownerId}`}
            kind={branchTarget.kind}
            ownerId={branchTarget.ownerId}
            onClose={() => setBranchTarget(null)}
            onSaved={(branch: Branch) =>
              setValue(branchTarget.branchPath as BillPath, String(branch.id), { shouldValidate: true })
            }
          />
        )}
      </div>
    </PartyActionsContext.Provider>
  )
}

function InvoicesSection() {
  const { control } = useBillForm()
  const { fields, append, remove } = useFieldArray({ control, name: 'invoices' })

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Invoices & goods</h2>
          <p className="text-sm text-gray-500">One invoice and one item are ready to fill in.</p>
        </div>
        <Button variant="outline" onClick={() => append(emptyInvoice())}>
          + Add invoice
        </Button>
      </div>
      {fields.map((field, index) => (
        <InvoiceEditor key={field.id} index={index} onRemove={fields.length > 1 ? () => remove(index) : undefined} />
      ))}
    </>
  )
}

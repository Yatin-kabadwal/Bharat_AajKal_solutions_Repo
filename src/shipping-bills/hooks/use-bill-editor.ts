import { routes } from '@/shared/route-paths'
import { useForm } from 'core/form'
import { useMutation } from 'core/react-query'
import { navigate } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useEffect, useRef, useState } from 'react'
import type { Path } from 'ui/form'
import { SubmissionRejectedError } from '../api'
import { emptyBill } from '../domain/defaults'
import { billTabs, firstTabWithError, type BillTab } from '../domain/form-tabs'
import type { FieldErrors, SavedBill, ShippingBillFormValues } from '../domain/types'
import { validateBill } from '../domain/validation'
import { billSchema } from '../schema/bill-schema'
import { saveBillDraft, submitBill } from './actions'
import { flattenErrorPaths } from './form-errors'

/**
 * Everything the bill editor does that is not drawing: form state, which tab is open, saving drafts
 * and submitting. The component that uses it is left with layout only.
 */
export function useBillEditor(bill: SavedBill | undefined) {
  const formCtx = useForm<ShippingBillFormValues>(billSchema, { defaultValues: bill?.values ?? emptyBill() })
  const { setError, getValues, formState } = formCtx.hooks

  const [activeTab, setActiveTab] = useState<BillTab>('details')
  // The server id of this bill once it has been saved at least once.
  const [billId, setBillId] = useState(bill?.id)

  // When a submit fails the schema rules, also show the cross-field problems right away (react-hook-form
  // stops at the first phase), then take the user to the first tab with something to fix.
  const errorsRef = useRef(formState.errors)
  errorsRef.current = formState.errors
  useEffect(() => {
    if (formState.submitCount === 0) return
    const schemaPaths = flattenErrorPaths(errorsRef.current)
    if (schemaPaths.length === 0) return

    const extra = Object.entries(validateBill(getValues())).filter(([path]) => !schemaPaths.includes(path))
    showFieldErrors(Object.fromEntries(extra))

    const paths = [...schemaPaths, ...extra.map(([path]) => path)]
    const tab = firstTabWithError(paths)
    if (tab) setActiveTab(tab)
    toast.error(paths.length === 1 ? 'Please fix 1 field' : `Please fix ${paths.length} fields`)
    // Only a new submit attempt should run this, not every later change to the errors.
  }, [formState.submitCount])

  function showFieldErrors(errors: FieldErrors) {
    Object.entries(errors).forEach(([path, message]) => {
      // `_` is how the server reports a problem that belongs to no field.
      if (path === '_') toast.error(message)
      else setError(path as Path<ShippingBillFormValues>, { type: 'validate', message })
    })
  }

  // Runs after the schema rules passed. Rules that relate fields to each other, then the server's.
  async function handleSubmit(values: ShippingBillFormValues) {
    const clientErrors = validateBill(values)
    if (Object.keys(clientErrors).length > 0) return showFieldErrors(clientErrors)

    try {
      const { bill: saved, referenceNumber } = await submitBill(values, billId)
      setBillId(saved.id)
      toast.success(`Shipping bill ${referenceNumber} submitted`)
      navigate(routes.dashboard)
    } catch (error) {
      // The server refused specific fields: show them next to the inputs. Anything else (network,
      // 5xx) is rethrown so <Form> retries it and finally shows its error banner.
      if (error instanceof SubmissionRejectedError) return showFieldErrors(error.fieldErrors)
      throw error
    }
  }

  const draft = useMutation({
    mutationFn: () => saveBillDraft(getValues(), billId),
    onSuccess: (saved) => {
      setBillId(saved.id)
      toast.success('Draft saved')
    }
  })

  const tabIndex = billTabs.findIndex((tab) => tab.value === activeTab)
  const previousTab = billTabs[tabIndex - 1] as (typeof billTabs)[number] | undefined
  const nextTab = billTabs[tabIndex + 1] as (typeof billTabs)[number] | undefined

  return {
    formCtx,
    activeTab,
    setActiveTab,
    previousTab: previousTab?.value,
    nextTab: nextTab?.value,
    handleSubmit,
    isSavingDraft: draft.isPending,
    /** Saves the draft, then optionally moves to another tab once the save has worked. */
    saveDraft: (thenOpen?: BillTab) => draft.mutate(undefined, { onSuccess: () => thenOpen && setActiveTab(thenOpen) })
  }
}

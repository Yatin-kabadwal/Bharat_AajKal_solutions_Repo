import { getFormContext } from 'core/form'
import { Path, useWatch } from 'ui/form'
import type { ShippingBillFormValues } from '../domain/types'

/** The react-hook-form handle of the bill form, typed. Valid anywhere below `<Form>`. */
export function useBillForm() {
  return getFormContext<ShippingBillFormValues>().hooks
}

/** Subscribes to one field of the bill form, with the value type inferred from its path. */
export function useBillWatch<P extends Path<ShippingBillFormValues>>(name: P) {
  // fe-zen-arch has no react-hook-form provider, so the control is passed explicitly.
  const { control } = useBillForm()
  return useWatch<ShippingBillFormValues, P>({ control, name })
}

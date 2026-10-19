import { FormSelectProps, Select } from 'ui/inputs/select'
import type { ShippingBillFormValues } from '../../domain/types'

/** `Select` bound to the bill form's field paths, so `name` is type-checked everywhere. */
export function BillSelect(props: FormSelectProps<ShippingBillFormValues>) {
  return <Select<ShippingBillFormValues> {...props} />
}

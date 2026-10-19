interface CheckboxProps {
  id?: string
  name?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  ref?: React.Ref<HTMLInputElement>
}

// Have not added InputError in Checkbox, as different usage require different layouts,
// if using Checkbox as required field, must add InputError

export function Checkbox(props: CheckboxProps) {
  return <input type="checkbox" className="accent-primary-600 size-4 rounded" {...props} />
}

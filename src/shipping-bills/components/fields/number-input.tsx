import { ComponentProps } from 'react'
import { Input } from 'ui/inputs/input'

// Native number inputs reject decimals (2.5, 3.831) unless `step` allows them, and the browser then
// blocks the whole form from submitting. Every numeric field accepts decimals, so set that once here.
// (`step` is not in <Input>'s declared props, but it is spread onto the <input> element.)
const numeric = { type: 'number', step: 'any' } as const

export function NumberInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  return <Input {...props} {...numeric} />
}

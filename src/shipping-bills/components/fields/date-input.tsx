import { ComponentProps } from 'react'
import { Input } from 'ui/inputs/input'

// fe-zen-arch's <Input> does not list `type="date"` yet. Native date inputs work fine, so the cast
// lives here, in one place, instead of at every call site.
const dateType = 'date' as 'text'

export function DateInput(props: Omit<ComponentProps<typeof Input>, 'type'>) {
  return <Input {...props} type={dateType} />
}

// The form is split into three tabs. When validation fails we jump to the first tab that has an error.

export type BillTab = 'details' | 'invoices' | 'documents'

export const billTabs: { value: BillTab; label: string }[] = [
  { value: 'details', label: '1. Details' },
  { value: 'invoices', label: '2. Invoices & goods' },
  { value: 'documents', label: '3. Others' }
]

const documentsTabSections = ['containers', 'packingRanges', 'documents', 'licenses']

/** Which tab renders the input for this field path (e.g. `invoices.0.items.1.quantity`)? */
export function tabForPath(path: string): BillTab {
  const root = path.split('.')[0]
  if (root === 'invoices') return 'invoices'
  if (documentsTabSections.includes(root)) return 'documents'
  return 'details'
}

export function firstTabWithError(paths: string[]): BillTab | undefined {
  return billTabs.find((tab) => paths.some((path) => tabForPath(path) === tab.value))?.value
}

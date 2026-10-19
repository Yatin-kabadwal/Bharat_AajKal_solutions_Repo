import { createContext, useContext } from 'react'
import type { FormOptions } from '../domain/types'

// The reference data is loaded once by the page and handed down through context, so the many
// selects deep in the form read it without prop drilling.
export const FormOptionsContext = createContext<FormOptions | null>(null)

export function useFormOptions(): FormOptions {
  const options = useContext(FormOptionsContext)
  if (options == null) throw new Error('useFormOptions must be used inside <FormOptionsContext.Provider>')
  return options
}

import { useEffect, useRef } from 'react'
import { Path, useWatch } from 'react-hook-form'
import { DisallowNever } from 'ui/utils'
import { getFormContext } from '../form'

interface DFieldProps<T, K = Path<T>> {
  fieldNames: K[]
  watch: [K[], (...args: T[keyof T][]) => boolean]
  render: () => React.ReactNode
}

// Utility component to easily work with react-hook-form, helps to
// show optional input based on the value of other fields values
// Example: Only show company name, if account type has company value

export function DependentField<T>({ fieldNames, watch, render }: DFieldProps<DisallowNever<T>>) {
  const {
    hooks: { control, unregister }
  } = getFormContext()
  const watchedValue = useWatch({ control, name: watch[0] as string[] })
  const shouldShow = watch[1](...watchedValue)
  const unregistered = useRef<boolean>(false)

  useEffect(() => {
    if (!shouldShow && !unregistered.current) {
      unregistered.current = true
      // keepDefaultValue is required to be true, when a form is reset (case: when cancelled while editing prefilled form)
      unregister(fieldNames, { keepDefaultValue: true })
    } else {
      unregistered.current = false
    }
    // Don't use fieldNames as dependency, will cause infinite callback of useEffect
  }, [shouldShow])

  return shouldShow ? render() : null
}

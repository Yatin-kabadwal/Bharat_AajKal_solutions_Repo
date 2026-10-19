import { RrExclamation } from 'icons/rr/fi-rr-exclamation'
import { FieldError, FieldErrorsImpl, Merge, Path } from 'react-hook-form'
import { DisallowNever } from 'ui/utils'
import { FormContextData, getFormContext, getNestedSchema } from '../form'

interface Props<T> {
  name: Path<T> | undefined
}

export function InputError<T>({ name }: Props<DisallowNever<T>>) {
  if (name == null) return
  const context = getFormContext() as FormContextData<any> | undefined
  if (context == null) return null

  const allErrors = context.hooks.formState.errors
  const error = (name as string).includes('.') ? getNestedValue(allErrors, name) : (allErrors[name] as FieldError)
  if (error == null) return null

  const errorMessage =
    error.message != '' ? error.message : getErrorMessage(error, getNestedSchema(name, context.schema))

  return (
    <div className="mt-1 flex items-center text-sm text-red-500">
      <RrExclamation className="mr-1 size-3" />
      <span>{errorMessage as string}</span>
    </div>
  )
}

type FormError = FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined

function getNestedValue(obj: object, path: string): FormError {
  // @ts-expect-error
  // eslint-disable-next-line
  return path.split('.').reduce((current, key) => current && current[key], obj)
}

const defaultError = 'invalid input'

function getErrorMessage(error: FieldError | Merge<FieldError, FieldErrorsImpl<any>>, rules: any) {
  if (!error.type) return defaultError

  switch (error.type) {
    case 'required':
      return 'required'
    case 'min':
      return rules?.min == null ? defaultError : `minimum ${rules.min} allowed`
    case 'max':
      return rules?.max == null ? defaultError : `maximum ${rules.max} allowed`
    case 'minLength':
      return rules?.minLength == null ? defaultError : `minimum ${rules.minLength} character required`
    case 'maxLength':
      return rules?.maxLength == null ? defaultError : `maximum ${rules.maxLength} character required`
    case 'pattern':
      return 'invalid format'
    case 'validate':
      return 'invalid input'
    case 'valueAsNumber':
      return 'must be a number'
    case 'valueAsDate':
      return 'must be a valid date'
    default:
      return defaultError
  }
}

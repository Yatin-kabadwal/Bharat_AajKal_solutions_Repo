import { createContext, useContext } from 'react'
import type { FieldValues, Path, RegisterOptions, UseFormProps, UseFormRegister, UseFormReturn } from 'react-hook-form'
import { useForm as rhfUseForm } from 'react-hook-form'
import type { ObjectSchema, SchemaType } from './form-schema/types'

export { useController, useFieldArray, useForm as useRhfForm, useWatch } from 'react-hook-form'
export type {
  FieldValues,
  Path,
  RegisterOptions,
  SubmitHandler,
  UseFormRegister,
  UseFormReturn,
  UseFormWatch
} from 'react-hook-form'

export interface FormContextData<T extends FieldValues> {
  hooks: UseFormReturn<T>
  schema: ObjectSchema<any>
}

export function useForm<T extends FieldValues>(schema: ObjectSchema<any>, props?: UseFormProps<T>): FormContextData<T> {
  const hooks = rhfUseForm<T>(props)
  hooks.register = registerFunc(hooks.register, schema)
  return { hooks, schema } as FormContextData<T>
}

export const FormContext = createContext<FormContextData<any> | null>(null)

export function getFormContext<T extends FieldValues>() {
  return useContext(FormContext) as FormContextData<T>
}

export function useFormHook<T extends FieldValues>() {
  return useContext(FormContext)!.hooks as UseFormReturn<T>
}

function registerFunc<T extends FieldValues>(originalRegister: UseFormRegister<T>, schema: ObjectSchema<any>) {
  return function (key: Path<T>, options: RegisterOptions<T> = {}) {
    const finalOptions = { ...getNestedSchema(key, schema), ...options } as RegisterOptions<T>
    return originalRegister(key, finalOptions)
  } as UseFormRegister<T>
}

export function getNestedSchema(key: string, objSchema: ObjectSchema<any>): SchemaType {
  if (!key.includes('.')) return objSchema.shape[key] as SchemaType

  // Old implementation can be removed in future, if we don't get a bug with new implementation
  // == Old Implementation ==
  // const keys = key.split('.')
  // let schemaType = objSchema
  // for (const element of keys) {
  //   schemaType = schemaType.shape[element]
  // }
  // return schemaType

  // == New Implementation ==
  const lastKey = key.substring(key.lastIndexOf('.') + 1)
  return objSchema.shape[lastKey] as SchemaType
}

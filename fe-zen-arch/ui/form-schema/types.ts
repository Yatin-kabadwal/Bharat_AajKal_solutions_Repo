// Base schema types
// prettier-ignore
export type SchemaType =
  | StringSchema
  | EnumSchema<any>
  | NumberSchema
  | BooleanSchema
  | ArraySchema<any>
  | ObjectSchema<any>

export type ValidateFunction<T> = (value: T, formData?: any) => string | undefined

interface BaseSchema {
  required?: boolean | string
  validate?: ValidateFunction<any>
}

export interface PatternValidation {
  value: RegExp
  message: string
}

// String schema
export interface StringSchema extends BaseSchema {
  type: 'string'
  minLength?: number
  maxLength?: number
  pattern?: PatternValidation
}

// Enum schema
export interface EnumSchema<T extends readonly string[] | number[]> extends BaseSchema {
  type: 'enum'
  values: T
}

// Number schema
export interface NumberSchema extends BaseSchema {
  type: 'number'
  min?: number
  max?: number
  valueAsNumber?: boolean
}

// Boolean schema
export interface BooleanSchema extends BaseSchema {
  type: 'boolean'
  default?: boolean
}

// Array schema
export interface ArraySchema<T extends SchemaType> extends BaseSchema {
  type: 'array'
  itemType: T
  default?: any[]
  minItems?: number
  maxItems?: number
}

// Object schema
export interface ObjectSchema<Shape extends Record<string, SchemaType>> extends BaseSchema {
  type: 'object'
  shape: Shape
}

// Helpers to split optional vs required keys
type OptionalKeys<Shape extends Record<string, SchemaType>> = {
  [K in keyof Shape]: Shape[K] extends { required: false } ? K : never
}[keyof Shape]

type RequiredKeys<Shape extends Record<string, SchemaType>> = Exclude<keyof Shape, OptionalKeys<Shape>>

// Utility to expand and simplify resulting object types
type Expand<T> = T extends object ? { [K in keyof T]: T[K] } : T

// Object inference using required & optional
export type InferObject<Shape extends Record<string, SchemaType>> = Expand<
  // Required properties
  { [K in RequiredKeys<Shape>]: InferType<Shape[K]> } & {
    // Optional properties
    [K in OptionalKeys<Shape>]?: InferType<Shape[K]>
  }
>

// Main inference utility
// prettier-ignore
export type InferType<T extends SchemaType> = 
  T extends StringSchema ? string :
  T extends EnumSchema<any> ? T['values'][number] :
  T extends NumberSchema ? number :
  T extends BooleanSchema ? boolean :
  T extends ArraySchema<infer U> ? InferType<U>[] :
  T extends ObjectSchema<infer Shape> ? InferObject<Shape> :
  never

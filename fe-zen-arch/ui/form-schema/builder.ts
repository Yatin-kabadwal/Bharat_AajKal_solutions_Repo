// Fluent Schema Builder for TypeScript
// Supports Zod-like chaining and leverages existing SchemaType & InferType for type inference

import type {
  ArraySchema,
  BooleanSchema,
  EnumSchema,
  InferType,
  NumberSchema,
  ObjectSchema,
  SchemaType,
  StringSchema,
  ValidateFunction
} from './types'

// Base Schema Builder
export abstract class BaseSchemaBuilder<T> {
  required: string | boolean = true
  validate?: ValidateFunction<any>

  refine(fn: ValidateFunction<T>) {
    this.validate = fn
    return this
  }

  requiredMsg(message: string) {
    this.required = message
    return this
  }

  optional(): this & { required: false } {
    this.required = false
    return this as this & { required: false }
  }
}

// String Builder
export class StringBuilder extends BaseSchemaBuilder<string> implements StringSchema {
  readonly type = 'string' as const
  minLength?: number
  maxLength?: number
  pattern?: { value: RegExp; message: string }

  minVal(length: number) {
    this.minLength = length
    return this
  }

  maxVal(length: number) {
    this.maxLength = length
    return this
  }

  matches(regex: RegExp, message: string) {
    this.pattern = { value: regex, message }
    return this
  }
}

export function string() {
  return new StringBuilder()
}

// Enum Builder
export class EnumBuilder<T extends readonly string[] | number[]> extends BaseSchemaBuilder<T> implements EnumSchema<T> {
  readonly type = 'enum' as const
  readonly values: T

  constructor(values: T) {
    super()
    this.values = values
  }
}

export function enumeration<T extends readonly string[] | number[]>(values: T) {
  return new EnumBuilder(values)
}

// Number Builder
export class NumberBuilder extends BaseSchemaBuilder<number> implements NumberSchema {
  readonly type = 'number' as const
  min?: number
  max?: number
  valueAsNumber?: boolean

  minVal(value: number) {
    this.min = value
    return this
  }

  maxVal(value: number) {
    this.max = value
    return this
  }

  asNumber() {
    this.valueAsNumber = true
    return this
  }
}

export function number() {
  return new NumberBuilder()
}

// Boolean Builder
export class BooleanBuilder extends BaseSchemaBuilder<boolean> implements BooleanSchema {
  readonly type = 'boolean' as const
}

export function boolean() {
  return new BooleanBuilder()
}

// Array Builder
export class ArrayBuilder<T extends SchemaType> extends BaseSchemaBuilder<InferType<T>[]> implements ArraySchema<T> {
  readonly type = 'array' as const
  readonly itemType: T

  constructor(itemType: T) {
    super()
    this.itemType = itemType
  }
}

export function array<T extends SchemaType>(itemType: T) {
  return new ArrayBuilder(itemType)
}

// Object Builder
type ShapeMap = Record<string, SchemaType>
export class ObjectBuilder<Shape extends ShapeMap> extends BaseSchemaBuilder<any> implements ObjectSchema<Shape> {
  readonly type = 'object' as const
  readonly shape: Shape

  constructor(shape: Shape) {
    super()
    this.shape = shape
  }

  // Override refine with the correct type
  refine(fn: ValidateFunction<{ [K in keyof Shape]: InferType<Shape[K]> }>) {
    this.validate = fn
    return this
  }
}

export function object<Shape extends ShapeMap>(shape: Shape) {
  return new ObjectBuilder(shape)
}

// Central namespace for ease of use
const schema = {
  string,
  number,
  boolean,
  enum: enumeration,
  array,
  object
}

export { schema as s }

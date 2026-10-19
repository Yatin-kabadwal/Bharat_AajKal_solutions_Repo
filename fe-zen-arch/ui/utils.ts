import { cva, VariantProps } from 'class-variance-authority'
import { clsx as clsxLite } from 'clsx/lite'
import { useContext } from 'react'

export type DisallowNever<T> = [T] extends [never] ? "Error: Type 'never' is not allowed" : T

function getContext<T>(ctx: React.Context<T | null>): T {
  const context = useContext(ctx)
  if (context == null) throw new Error(`Context was accessed outside Context Provider`)
  return context
}

export function clsx(base: string, add: string | undefined | null) {
  return add == null ? base : `${base} ${add}`
}

export { clsxLite as clsxJoin, cva, getContext }
export type { VariantProps }

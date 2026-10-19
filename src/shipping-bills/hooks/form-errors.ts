/**
 * Flattens react-hook-form's nested `errors` object into field paths, e.g.
 * `{ invoices: [{ items: [{ quantity: {message} }] }] }` -> `['invoices.0.items.0.quantity']`.
 */
export function flattenErrorPaths(errors: unknown, prefix = ''): string[] {
  if (errors == null || typeof errors !== 'object') return []
  // A leaf error carries a `type` ('required', 'validate', ...); containers do not.
  if ('type' in errors && typeof errors.type === 'string') return [prefix]

  return Object.entries(errors).flatMap(([key, value]) => flattenErrorPaths(value, prefix ? `${prefix}.${key}` : key))
}

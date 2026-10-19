// One place for every react-query key, so invalidation can never miss a cache entry by typo.
export const queryKeys = {
  formOptions: ['shipping-bills', 'form-options'] as const,
  bills: ['shipping-bills', 'bills'] as const,
  bill: (id: number) => ['shipping-bills', 'bill', id] as const,
  marksAndNumbers: (exporterId: string) => ['shipping-bills', 'marks', exporterId] as const,
  /** Everything party related: searches, labels and branch lists. */
  parties: ['shipping-bills', 'parties'] as const
}

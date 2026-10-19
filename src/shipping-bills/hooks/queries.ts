import { useQuery } from 'core/react-query'
import { shippingBillApi } from '../api'
import { queryKeys } from './query-keys'

export function useFormOptionsQuery() {
  return useQuery({ queryKey: queryKeys.formOptions, queryFn: () => shippingBillApi.getFormOptions() })
}

export function useBillsQuery() {
  // The list changes whenever any bill is saved, so always refetch it when the page is shown.
  return useQuery({ queryKey: queryKeys.bills, queryFn: () => shippingBillApi.listBills(), staleTime: 0 })
}

export function useBillQuery(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.bill(id ?? 0),
    queryFn: () => shippingBillApi.getBill(id!),
    enabled: id != null,
    // Never show a cached copy while editing: the form copies the values once on mount.
    staleTime: 0,
    gcTime: 0
  })
}

export function useMarksAndNumbersQuery(exporterId: string) {
  return useQuery({
    queryKey: queryKeys.marksAndNumbers(exporterId),
    queryFn: () => shippingBillApi.getMarksAndNumbers(exporterId),
    enabled: exporterId !== ''
  })
}

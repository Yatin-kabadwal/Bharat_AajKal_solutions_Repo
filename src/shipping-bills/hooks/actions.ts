import { queryClient } from 'core/react-query'
import type { BranchInput, BusinessInput, ExporterInput } from '../api'
import { shippingBillApi } from '../api'
import type { Branch, Business, Exporter, PartyKind, ShippingBillFormValues } from '../domain/types'
import { queryKeys } from './query-keys'

// Writes. Each one calls the API and then invalidates the cached reads it makes stale, so the
// components never have to know which queries depend on which data.

export async function saveBillDraft(values: ShippingBillFormValues, id?: number) {
  const bill = await shippingBillApi.saveDraft(values, id)
  await queryClient.invalidateQueries({ queryKey: queryKeys.bills })
  return bill
}

export async function submitBill(values: ShippingBillFormValues, id?: number) {
  const result = await shippingBillApi.submitBill(values, id)
  await queryClient.invalidateQueries({ queryKey: queryKeys.bills })
  return result
}

export async function saveExporter(input: ExporterInput): Promise<Exporter> {
  const exporter = await shippingBillApi.saveExporter(input)
  await queryClient.invalidateQueries({ queryKey: queryKeys.parties })
  return exporter
}

export async function saveBusiness(input: BusinessInput): Promise<Business> {
  const business = await shippingBillApi.saveBusiness(input)
  await queryClient.invalidateQueries({ queryKey: queryKeys.parties })
  return business
}

export async function saveBranch(kind: PartyKind, ownerId: number, input: BranchInput): Promise<Branch> {
  const branch = await shippingBillApi.saveBranch(kind, ownerId, input)
  await queryClient.invalidateQueries({ queryKey: queryKeys.parties })
  return branch
}

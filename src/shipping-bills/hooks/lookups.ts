import { PortKind, shippingBillApi } from '../api'
import type { BusinessRole, PartyKind } from '../domain/types'
import { queryKeys } from './query-keys'

// A "lookup" is how a searchable select talks to the data layer: search by text, and turn a stored
// value (an id or a code) back into a label. Selects depend on this small interface only.

export interface LookupOption {
  value: string
  label: string
  sublabel?: string
}

export interface Lookup {
  /** Prefix of the react-query keys used for this lookup. Include anything the results depend on. */
  key: readonly unknown[]
  search: (query: string) => Promise<LookupOption[]>
  /** Label for an already selected value. `undefined` when the record no longer exists. */
  label: (value: string) => Promise<string | undefined>
}

function branchLabel(branch: { branchName: string; city: string }) {
  return `${branch.branchName} · ${branch.city}`
}

function portLabel(port: { name: string; code: string }) {
  return `${port.name} · ${port.code}`
}

export function exporterLookup(): Lookup {
  return {
    key: [...queryKeys.parties, 'exporter'],
    search: async (query) =>
      (await shippingBillApi.searchExporters(query)).map((exporter) => ({
        value: String(exporter.id),
        label: exporter.name,
        sublabel: exporter.iec ? `IEC: ${exporter.iec}` : undefined
      })),
    label: async (id) => (await shippingBillApi.getExporter(id))?.name
  }
}

export function businessLookup(role: BusinessRole): Lookup {
  return {
    key: [...queryKeys.parties, 'business', role],
    search: async (query) =>
      (await shippingBillApi.searchBusinesses(role, query)).map((business) => ({
        value: String(business.id),
        label: business.name
      })),
    label: async (id) => (await shippingBillApi.getBusiness(id))?.name
  }
}

export function branchLookup(kind: PartyKind, ownerId: string): Lookup {
  return {
    key: [...queryKeys.parties, 'branch', kind, ownerId],
    search: async (query) =>
      (await shippingBillApi.searchBranches(kind, ownerId, query)).map((branch) => ({
        value: String(branch.id),
        label: branchLabel(branch),
        sublabel: branch.address1
      })),
    label: async (id) => {
      const branches = await shippingBillApi.searchBranches(kind, ownerId, '')
      const branch = branches.find((item) => String(item.id) === id)
      return branch && branchLabel(branch)
    }
  }
}

export function portLookup(kind: PortKind): Lookup {
  return {
    key: ['shipping-bills', 'ports', kind],
    search: async (query) =>
      (await shippingBillApi.searchPorts(kind, query)).map((port) => ({
        value: port.code,
        label: portLabel(port),
        sublabel: `Country: ${port.countryCode}`
      })),
    label: async (code) => {
      const port = await shippingBillApi.getPort(code)
      return port ? portLabel(port) : code
    }
  }
}

export function documentTypeLookup(): Lookup {
  return {
    key: ['shipping-bills', 'document-types'],
    search: async (query) =>
      (await shippingBillApi.searchDocumentTypes(query)).map((type) => ({
        value: String(type.value),
        label: type.label
      })),
    label: async (code) => {
      const types = await shippingBillApi.searchDocumentTypes(code)
      return types.find((type) => String(type.value) === code)?.label ?? code
    }
  }
}

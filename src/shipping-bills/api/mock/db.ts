import type { Business, Exporter, SavedBill } from '../../domain/types'
import { seedBills } from './fixtures/bills'
import { seedBusinesses, seedExporters } from './fixtures/parties'

// The mock "database": plain arrays kept in memory and mirrored to localStorage so created records
// survive a page reload. Only `mock-api.ts` touches it. The UI never imports this file.

interface MockDatabase {
  exporters: Exporter[]
  businesses: Business[]
  bills: SavedBill[]
}

// Bump the version when the stored shape changes, so stale data from an older build is ignored.
const STORAGE_KEY = 'export-software-mock-db-v3'

function seed(): MockDatabase {
  return structuredClone({ exporters: seedExporters, businesses: seedBusinesses, bills: seedBills })
}

function isDatabase(value: unknown): value is MockDatabase {
  const db = value as Partial<MockDatabase> | null
  return Array.isArray(db?.exporters) && Array.isArray(db.businesses) && Array.isArray(db.bills)
}

function load(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (isDatabase(parsed)) return parsed
  } catch {
    // Storage unavailable or corrupt: start from the seed.
  }
  return seed()
}

const db = load()

export function database(): MockDatabase {
  return db
}

/** Call after mutating `database()`. */
export function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Still usable in memory when storage is disabled or full.
  }
}

/** Ids are unique across exporters, businesses, branches and bills, like one shared sequence. */
export function nextId(): number {
  const ids = [
    ...db.exporters.flatMap((party) => [party.id, ...party.branches.map((branch) => branch.id)]),
    ...db.businesses.flatMap((party) => [party.id, ...party.branches.map((branch) => branch.id)]),
    ...db.bills.map((bill) => bill.id)
  ]
  return Math.max(3000, ...ids) + 1
}

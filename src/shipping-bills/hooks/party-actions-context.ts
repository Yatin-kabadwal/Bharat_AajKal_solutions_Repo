import { createContext, useContext } from 'react'
import type { BusinessRole, PartyKind } from '../domain/types'

// Pickers deep inside the form need to open the "add party" / "add branch" dialogs, which are owned
// by the editor. This context carries those two callbacks down, so nothing has to be drilled.

export interface PartyTarget {
  kind: PartyKind
  role?: BusinessRole
  /** Form paths that receive the new party and its first branch. */
  ownerPath: string
  branchPath: string
}

export interface BranchTarget {
  kind: PartyKind
  ownerId: number
  branchPath: string
}

export interface PartyActions {
  addParty: (target: PartyTarget) => void
  addBranch: (target: BranchTarget) => void
}

export const PartyActionsContext = createContext<PartyActions | null>(null)

export function usePartyActions(): PartyActions {
  const actions = useContext(PartyActionsContext)
  if (actions == null) throw new Error('usePartyActions must be used inside <PartyActionsContext.Provider>')
  return actions
}

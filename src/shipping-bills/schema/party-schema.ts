import { s } from 'core/form'
import { GSTIN_PATTERN, IEC_PATTERN, IFSC_PATTERN, PAN_PATTERN } from '../domain/identifiers'

// Rules for the "add exporter / business" and "add branch" dialogs. Same leaf-name rule as
// `bill-schema.ts`: keep every name unique within one schema.

const capitals = 'Use capital letters and digits'

export const partySchema = s.object({
  name: s.string().minVal(2),
  iec: s.string().optional().matches(IEC_PATTERN, `IEC is 10 characters. ${capitals}`),
  class: s.string().optional(),
  type: s.string().optional(),
  pan: s.string().optional().matches(PAN_PATTERN, 'PAN looks like AAECA1234F'),
  tan: s.string().optional(),
  aeoNumber: s.string().optional(),
  website: s.string().optional(),
  notes: s.string().optional(),
  isConsignee: s.boolean().optional(),
  isBuyer: s.boolean().optional(),
  isNotify: s.boolean().optional(),
  isThirdParty: s.boolean().optional(),
  branchName: s.string().optional(),
  address1: s.string().optional(),
  city: s.string().optional(),
  state: s.string().optional(),
  pincode: s.string().optional(),
  countryCode: s.string()
})

export const branchSchema = s.object({
  branchName: s.string().minVal(2),
  address1: s.string().minVal(2),
  address2: s.string().optional(),
  city: s.string().minVal(2),
  state: s.string().optional(),
  pincode: s.string().optional(),
  countryCode: s.string(),
  email: s.string().optional(),
  mobile: s.string().optional(),
  gstnId: s.string().optional().matches(GSTIN_PATTERN, `GSTIN has 15 characters. ${capitals}`),
  adCode: s.string().optional(),
  accountNo: s.string().optional(),
  ifscCode: s.string().optional().matches(IFSC_PATTERN, 'IFSC looks like HDFC0001234')
})

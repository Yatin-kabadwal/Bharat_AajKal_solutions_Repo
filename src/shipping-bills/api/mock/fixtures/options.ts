import type { FormOptions, Option } from '../../../domain/types'
import { documentCodes } from './document-codes'
import { quantityCodes } from './quantity-codes'
import schemeCodes from './scheme-codes'
import { stateOptions } from './states'
import { Trades } from './trade-agreements'

// Reference data the form needs. In production this is a "GET /form-options" response.

export const documentTypes: Option[] = documentCodes

export const formOptions: FormOptions = {
  currencies: ['USD', 'EUR', 'INR', 'AED', 'GBP', 'SGD'].map((value) => ({ value, label: value })),
  countries: [
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'DE', label: 'Germany' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'SG', label: 'Singapore' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'KR', label: 'South Korea' }
  ],
  // The state list is keyed by number in its source; form values are strings.
  states: stateOptions.map((state) => ({ value: String(state.value), label: state.label })),
  cargoTypes: [
    { value: 'P', label: 'Packaged cargo - P' },
    { value: 'C', label: 'Containerized - C' },
    { value: 'CP', label: 'Containerized packages - CP' },
    { value: 'LB', label: 'Liquid bulk - LB' },
    { value: 'DB', label: 'Dry bulk - DB' }
  ],
  sealTypes: [
    { value: 'S', label: 'S - Self sealed' },
    { value: 'A', label: 'A - Agency / Customs sealed' },
    { value: 'W', label: 'W - Warehouse / Port sealed' }
  ],
  contractTypes: [
    { value: 'FOB', label: 'FOB (Free on Board)' },
    { value: 'CF', label: 'CF (Cost + Freight)' },
    { value: 'CIF', label: 'CIF (Cost + Insurance + Freight)' },
    { value: 'CI', label: 'CI - (Cost + Insurance)' }
  ],
  weightUnits: [
    { value: 'KG', label: 'kg (kilogram)' },
    { value: 'g', label: 'g (gram)' },
    { value: 'MT', label: 'mt (metric ton)' },
    { value: 'lb', label: 'lb (pound)' }
  ],
  paymentTypes: [
    { value: 'DP', label: 'DP (Direct payment)' },
    { value: 'AP', label: 'AP (Advance payment)' },
    { value: 'LC', label: 'LC (Letter of credit)' },
    { value: 'DA', label: 'DA (Delivery against acceptance)' },
    { value: 'NA', label: 'NA (Not applicable)' }
  ],
  priceInclusionTypes: [
    { value: 'B', label: 'Freight and insurance - B' },
    { value: 'F', label: 'Freight only - F' },
    { value: 'I', label: 'Insurance only - I' },
    { value: 'N', label: 'Neither - N' }
  ],
  schemeCodes: schemeCodes,
  quantityCodes,
  tradeAgreements: Trades.map((trade) => ({ value: trade.value, label: trade.label.trim() })),
  igstPaymentStatuses: [
    { value: 'NA', label: 'Not applicable' },
    { value: 'LUT', label: 'Under LUT / bond' },
    { value: 'P', label: 'Against payment' }
  ],
  accessoryStatuses: [
    { value: '0', label: 'No accessory' },
    { value: '1', label: 'Included free of cost' },
    { value: '2', label: 'Entered separately' }
  ],
  nfeiCategories: [
    { value: '01', label: 'Free trade sample' },
    { value: '02', label: 'Diplomatic goods' },
    { value: '03', label: 'Warranty replacement' },
    { value: '07', label: 'Gift parcel' },
    { value: '08', label: 'Other' }
  ],
  containerSizes: [
    { value: '20', label: '20 ft' },
    { value: '40', label: '40 ft' },
    { value: '45', label: '45 ft' }
  ],
  containerSealTypes: [
    { value: '1', label: 'BTSL - Bottle Seal' },
    { value: '2', label: 'ESEAL - Electronic Seal' },
    { value: '3', label: 'RFID - Radio Frequency Identifier' }
  ],
  licenseSources: [
    { value: 'I', label: 'Imported' },
    { value: 'D', label: 'Indigenous' }
  ],
  documentFileTypes: [{ value: 'pdf', label: 'PDF' }],
  exporterClasses: [
    { value: 'F', label: 'Manufacturer' },
    { value: 'R', label: 'Merchant' },
    { value: 'C', label: 'Merchant courier' },
    { value: 'D', label: 'Manufacturer courier' }
  ],
  exporterTypes: [
    { value: 'P', label: 'Private' },
    { value: 'G', label: 'Government' },
    { value: 'W', label: 'Warehouse' }
  ]
}

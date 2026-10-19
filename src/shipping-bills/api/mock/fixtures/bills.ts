import { emptyBill } from '../../../domain/defaults'
import type { SavedBill, ShippingBillFormValues } from '../../../domain/types'

// Seed shipping bills for the mock backend. Dates are fixed so the data is the same on every run.

const submittedValues: ShippingBillFormValues = {
  ...emptyBill(),
  jobNumber: '2081',
  jobDate: '2026-09-18',
  exporterId: '1000',
  exporterBranchId: '1001',
  consigneeId: '2002',
  consigneeBranchId: '2003',
  loadingPort: 'INMUN1',
  finalDestinationPort: 'USMSY',
  natureOfCargo: 'P',
  grossWeight: '34.6',
  netWeight: '23.5',
  measurementUnit: 'KG',
  totalPackages: '12',
  invoices: [
    {
      invoiceNumber: 'EX/2081/2026',
      invoiceDate: '2026-09-17',
      currency: 'USD',
      contractType: 'FOB',
      buyerSameAsConsignee: true,
      buyerId: '2002',
      buyerBranchId: '2003',
      items: [
        {
          ritcCode: '61091000',
          goodsDescription1: 'Cotton T-shirts',
          quantity: '51',
          unitOfMeasurement: 'PCS',
          unitPrice: '3.831',
          igstPaymentStatus: 'LUT',
          rewardItem: true
        }
      ]
    }
  ]
}

const draftValues: ShippingBillFormValues = {
  ...emptyBill(),
  jobNumber: '2082',
  jobDate: '2026-10-02',
  exporterId: '1002',
  exporterBranchId: '1003',
  consigneeId: '2040',
  consigneeBranchId: '2041',
  loadingPort: 'INNSA1',
  finalDestinationPort: 'SGSIN',
  natureOfCargo: 'C',
  measurementUnit: 'KG',
  invoices: [
    {
      invoiceNumber: 'BHE/114/2026',
      invoiceDate: '2026-10-01',
      currency: 'SGD',
      contractType: 'CIF',
      buyerSameAsConsignee: true,
      buyerId: '',
      buyerBranchId: '',
      items: [
        {
          ritcCode: '09109100',
          goodsDescription1: 'Mixed spices, packed',
          quantity: '800',
          unitOfMeasurement: 'KGS',
          unitPrice: '4.2',
          tradeAgreementsCode: 'CEPASG'
        }
      ]
    }
  ]
}

export const seedBills: SavedBill[] = [
  {
    id: 3000,
    status: 'submitted',
    created: '2026-09-18T08:00:00.000Z',
    updated: '2026-09-18T08:00:00.000Z',
    values: submittedValues
  },
  {
    id: 3001,
    status: 'draft',
    created: '2026-10-02T09:30:00.000Z',
    updated: '2026-10-03T11:15:00.000Z',
    values: draftValues
  }
]

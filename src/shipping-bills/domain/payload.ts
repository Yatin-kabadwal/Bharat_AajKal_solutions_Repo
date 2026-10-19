import { invoiceTotal, isBlank, lineTotal, parseNumber } from './calculations'
import { portCountry } from './ports'
import type { BillInvoiceForm, ChargeKey, ShippingBillFormValues } from './types'

// Form values -> request body for `POST /shipping-bills`.
//
// The form edits flat, string-based values. The API wants numbers, resolved references and derived
// fields (countries from port codes, serial numbers from list positions, totals). That translation
// happens here, once, at the submit boundary, so no component needs to know the wire format.
//
// Some keys below (`freight_insaurance_included`, `packging_list`) are spelled the way the backend
// spells them. They are kept as-is on purpose: they are part of the contract, not typos to "fix".

/** Blank strings are omitted from the request instead of being sent as "". */
function text(value: string | undefined): string | undefined {
  return isBlank(value) ? undefined : value
}

function chargeCurrency(invoice: BillInvoiceForm, key: ChargeKey): string {
  return text(invoice[`${key}Currency`]) ?? invoice.currency
}

export function toShippingBillPayload(values: ShippingBillFormValues) {
  const dischargePort = text(values.dischargePort) ?? values.finalDestinationPort

  return {
    shipping_bill: {
      job_number: parseNumber(values.jobNumber),
      job_date: values.jobDate,
      exporter: Number(values.exporterId),
      exporter_branch: Number(values.exporterBranchId),
      consignee: Number(values.consigneeId),
      consignee_address: Number(values.consigneeBranchId),
      loading_port: values.loadingPort,
      loading_port_code: values.loadingPort,
      loading_country_code: portCountry(values.loadingPort),
      final_destination_port: values.finalDestinationPort,
      final_destination_country_code: portCountry(values.finalDestinationPort),
      discharge_port: dischargePort,
      discharge_country_code: portCountry(dischargePort),
      origin_state_code: parseNumber(values.originStateCode),
      nfei_category: parseNumber(values.nfeiCategory),
      rbi_waiver_number: text(values.rbiWaiverNumber),
      rbi_waiver_date: text(values.rbiWaiverDate),
      sealtype: text(values.sealType),
      natureofcargo: values.natureOfCargo,
      grossweight: parseNumber(values.grossWeight),
      netweight: parseNumber(values.netWeight),
      measurement_unit: values.measurementUnit,
      total_packages: parseNumber(values.totalPackages),
      marks_and_numbers: text(values.marksAndNumbers),
      loose_packets: parseNumber(values.loosePackets),
      // Listed containers win over the free-typed count.
      number_of_containers: values.containers.length || (parseNumber(values.numberOfContainers) ?? 0),
      mawb_number: text(values.mawbNumber),
      hawb_number: text(values.hawbNumber)
    },
    invoices: values.invoices.map((invoice, index) => {
      const buyerId = invoice.buyerSameAsConsignee ? values.consigneeId : invoice.buyerId
      const buyerBranchId = invoice.buyerSameAsConsignee ? values.consigneeBranchId : invoice.buyerBranchId

      return {
        serial_number: index + 1,
        invoicenumber: invoice.invoiceNumber,
        date: invoice.invoiceDate,
        currency: invoice.currency,
        contract_type: invoice.contractType,
        buyer: Number(buyerId),
        buyer_address: Number(buyerBranchId),
        third_party: parseNumber(invoice.thirdPartyId),
        third_party_address: parseNumber(invoice.thirdPartyBranchId),
        freight_rate: parseNumber(invoice.freightRate),
        freight_amount: parseNumber(invoice.freightAmount),
        freight_currency: chargeCurrency(invoice, 'freight'),
        insurance_rate: parseNumber(invoice.insuranceRate),
        insurance_amount: parseNumber(invoice.insuranceAmount),
        insurance_currency: chargeCurrency(invoice, 'insurance'),
        commission_rate: parseNumber(invoice.commissionRate),
        commission_amount: parseNumber(invoice.commissionAmount),
        commission_currency: chargeCurrency(invoice, 'commission'),
        discount_rate: parseNumber(invoice.discountRate),
        discount_amount: parseNumber(invoice.discountAmount),
        discount_currency: chargeCurrency(invoice, 'discount'),
        other_deductions_rate: parseNumber(invoice.otherDeductionsRate),
        other_deductions_amount: parseNumber(invoice.otherDeductionsAmount),
        other_deductions_currency: chargeCurrency(invoice, 'otherDeductions'),
        packing_charges: parseNumber(invoice.packingCharges),
        freight_insaurance_included: text(invoice.freightInsuranceIncluded),
        contract_number: text(invoice.contractNumber),
        nature_of_payment: text(invoice.natureOfPayment),
        period_of_payment: parseNumber(invoice.periodOfPayment),
        invoice_total: invoiceTotal(invoice),
        items: invoice.items.map((item, itemIndex) => ({
          item_serial_number: itemIndex + 1,
          ritc_code: item.ritcCode,
          goods_description_1: item.goodsDescription1,
          goods_description_2: text(item.goodsDescription2),
          goods_description_3: text(item.goodsDescription3),
          accessories_description: text(item.accessoriesDescription),
          scheme_code: text(item.schemeCode),
          quantity: Number(item.quantity),
          unit_of_measurement: item.unitOfMeasurement,
          unit_price: Number(item.unitPrice),
          unit_of_rate: text(item.unitOfRate) ?? item.unitOfMeasurement,
          line_total: lineTotal(item),
          present_market_value: parseNumber(item.presentMarketValue),
          no_of_units: parseNumber(item.numberOfUnits),
          accessory_status: text(item.accessoryStatus),
          third_party: item.thirdPartyItem,
          igst_payment_status: text(item.igstPaymentStatus),
          // Taxable value and IGST only apply when IGST is paid.
          taxable_value: item.igstPaymentStatus === 'P' ? parseNumber(item.taxableValue) : undefined,
          igst_amount: item.igstPaymentStatus === 'P' ? parseNumber(item.igstAmount) : undefined,
          drawback_serial_number: text(item.drawbackSerialNumber),
          drawback_quantity: parseNumber(item.drawbackQuantity),
          rodtep: parseNumber(item.rodtep),
          cess: parseNumber(item.cess),
          origin_district_code: parseNumber(item.originDistrictCode),
          trade_agreements_code: text(item.tradeAgreementsCode),
          end_use_of_item: text(item.endUseOfItem),
          total_package: parseNumber(item.totalPackage),
          reward_item: item.rewardItem
        }))
      }
    }),
    invoice_item_third_parties: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        item.thirdPartyItem && item.itemThirdPartyId
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                third_party: Number(item.itemThirdPartyId),
                third_party_address: parseNumber(item.itemThirdPartyBranchId)
              }
            ]
          : []
      )
    ),
    ar4_details: values.invoices.flatMap((invoice, invoiceIndex) =>
      invoice.items.flatMap((item, itemIndex) =>
        item.ar4Number
          ? [
              {
                invoice_serial_number: invoiceIndex + 1,
                item_serial_number: itemIndex + 1,
                ar4_number: item.ar4Number,
                ar4_date: text(item.ar4Date),
                commissionerate: text(item.ar4Commissionerate),
                division: text(item.ar4Division),
                range: text(item.ar4Range),
                remarks: text(item.ar4Remarks)
              }
            ]
          : []
      )
    ),
    container_details: values.containers.map((container) => ({
      container_number: container.containerNumber.trim().toUpperCase(),
      container_size: parseNumber(container.containerSize),
      excise_seal_number: text(container.exciseSealNumber),
      seal_date: text(container.sealDate),
      seal_type: text(container.sealType),
      seal_device_id: text(container.sealDeviceId),
      movement_document_type: text(container.movementDocumentType),
      movement_document_number: text(container.movementDocumentNumber)
    })),
    packging_list: values.packingRanges.map((range) => ({
      packing_number_from: parseNumber(range.packingNumberFrom),
      packing_number_to: parseNumber(range.packingNumberTo),
      packing_code: text(range.packingCode)
    })),
    supporting_docs: values.documents.map((document, index) => ({
      serial_number: index + 1,
      invoice_serial_number: parseNumber(document.invoiceSerialNumber),
      item_serial_number: parseNumber(document.itemSerialNumber),
      document_type_code: document.documentTypeCode,
      document_reference_number: document.documentReferenceNumber,
      image_reference_number: text(document.imageReferenceNumber),
      document_issue_date: text(document.documentIssueDate),
      document_expiry_date: text(document.documentExpiryDate),
      place_of_issue: text(document.placeOfIssue),
      issuing_party_code: text(document.issuingPartyCode),
      issue_party_name: text(document.issuingPartyName),
      issuing_party_name_addr1: text(document.issuingPartyAddress1),
      issuing_party_name_addr2: text(document.issuingPartyAddress2),
      issuing_party_name_city: text(document.issuingPartyCity),
      issuing_party_name_pin: text(document.issuingPartyPin),
      beneficiary_party_code: text(document.beneficiaryPartyCode),
      beneficiary_party_name: text(document.beneficiaryPartyName),
      beneficiary_party_name_addr1: text(document.beneficiaryPartyAddress1),
      beneficiary_party_name_addr2: text(document.beneficiaryPartyAddress2),
      beneficiary_party_name_city: text(document.beneficiaryPartyCity),
      beneficiary_party_name_pin: text(document.beneficiaryPartyPin),
      file_type: text(document.fileType),
      icegate_id: text(document.icegateId)
    })),
    licenses: values.licenses.map((license) => ({
      registration_number: license.registrationNumber,
      registration_date: text(license.registrationDate),
      invoice_serial_number: parseNumber(license.invoiceSerialNumber),
      item_serial_number: parseNumber(license.itemSerialNumber),
      licence_serial_number: parseNumber(license.licenseSerialNumber),
      item_serial_number_part_e: text(license.itemSerialNumberPartE),
      item_serial_number_part_c: text(license.itemSerialNumberPartC),
      quantity: parseNumber(license.licenseQuantity),
      export_quantity: parseNumber(license.licenseExportQuantity),
      indigenous_or_imported: text(license.indigenousOrImported)
    }))
  }
}

export type ShippingBillPayload = ReturnType<typeof toShippingBillPayload>

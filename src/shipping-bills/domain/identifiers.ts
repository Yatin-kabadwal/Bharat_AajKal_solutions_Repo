// Formats of the Indian trade / tax identifiers a party can carry. Used by the party forms.

export const IEC_PATTERN = /^[A-Z0-9]{10}$/ // Importer-Exporter Code: 10 characters
export const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/ // e.g. AAECA1234F
export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/ // 15 characters
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/ // e.g. HDFC0001234
export const PIN_CODE_PATTERN = /^\d{6}$/ // Indian postal code

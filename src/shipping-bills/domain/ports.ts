// Port codes follow UN/LOCODE: the first two letters are the ISO country code.
const portCodePattern = /^[A-Z]{2}[A-Z0-9]{3}\d?$/

export function isValidPortCode(code: string): boolean {
  return portCodePattern.test(code)
}

export function portCountry(code: string | undefined): string {
  return code != null && portCodePattern.test(code) ? code.slice(0, 2) : ''
}

export function isIndianPort(code: string | undefined): boolean {
  return portCountry(code) === 'IN'
}

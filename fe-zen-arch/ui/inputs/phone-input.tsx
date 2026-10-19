import { Input } from 'ui/inputs/input'
import { Label } from './label'
import { SelectOption, SelectRaw } from './select'

interface Props {
  phoneRef: React.RefObject<HTMLInputElement>
  countryCodeRef: React.RefObject<HTMLInputElement>
  countryCodes: SelectOption[]
  disabled?: boolean
  wrapClass?: string
}

const maxPhoneDigits = 15

export function PhoneInput({ disabled, phoneRef, countryCodeRef, countryCodes, wrapClass }: Props) {
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, '').slice(0, maxPhoneDigits) // Allow only digits upto n length
    phoneRef.current.value = value
  }

  return (
    <div className={wrapClass}>
      <Label className="mb-1.5">Phone Number</Label>
      <div className="flex gap-2">
        <SelectRaw
          inputRef={countryCodeRef}
          placeholder="Code"
          wrapClass="w-24"
          maxHeight="400px"
          options={countryCodes}
          disabled={disabled}
        />
        <Input
          ref={phoneRef}
          type="tel"
          placeholder="Enter phone number"
          className="flex-1"
          wrapClass="grow"
          disabled={disabled}
          onChange={onInputChange}
        />
      </div>
    </div>
  )
}

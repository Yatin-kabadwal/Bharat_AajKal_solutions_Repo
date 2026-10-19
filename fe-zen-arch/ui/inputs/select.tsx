import { size } from '@floating-ui/react'
import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useEffect, useRef, useState } from 'react'
import { Path, RegisterOptions, useController } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { clsx, DisallowNever, getContext } from 'ui/utils'
import { getFormContext } from '../form'
import { InputError } from './error'
import { Label } from './label'

type SelectValue = number | string

export interface SelectOption {
  value: SelectValue
  label: string
  icon?: React.ReactNode
}

export interface BaseSelectProps {
  label?: string
  value?: SelectValue
  placeholder?: string
  disabled?: boolean
  triggerClass?: string
  wrapClass?: string
  maxHeight?: string
  readOnly?: boolean
}

export interface FormSelectProps<T> extends BaseSelectProps {
  name: Path<T>
  options: SelectOption[]
  deps?: React.DependencyList
  rules?: RegisterOptions
}

export function Select<T>({ name, options, deps = [], rules, ...props }: FormSelectProps<DisallowNever<T>>) {
  const ctx = getFormContext()
  const {
    field: { onChange, value, ref, disabled }
  } = useController({
    name: name,
    control: ctx.hooks.control,
    rules: ctx.schema.shape[name] ?? rules,
    disabled: props.disabled
  })
  const firstRender = useRef<boolean>(true)

  // Use useEffect to reset the value when options change and current selected value isn't in options
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const selected = ctx.hooks.getValues(name)
    if (selected != null) ctx.hooks.resetField(name)
  }, deps)

  return (
    <SelectBase
      {...props}
      name={name}
      value={value}
      options={options}
      onChange={onChange}
      inputRef={ref}
      disabled={disabled}
      inputError={<InputError name={name} />}
    />
  )
}

export type onChangeCallback = (e: SelectValue) => void

interface SelectRawProps extends BaseSelectProps {
  name?: string
  inputRef?: React.RefObject<HTMLInputElement>
  options: SelectOption[]
  onChange?: onChangeCallback
}

export function SelectRaw({ name, onChange, ...props }: SelectRawProps) {
  const [value, setValue] = useState<SelectValue | undefined>(props.value)

  return (
    <SelectBase
      {...props}
      name={name}
      value={value}
      onChange={(e) => {
        setValue(e)
        onChange?.(e)
      }}
    />
  )
}

interface SelectInnerProps extends BaseSelectProps {
  name?: string
  value: SelectValue | undefined
  options: SelectOption[]
  onChange: (e: SelectValue) => void
  inputError?: React.ReactElement
  inputRef?: React.ForwardedRef<HTMLInputElement>
}

function SelectBase({ options, disabled, value, readOnly, ...props }: SelectInnerProps) {
  function renderSelectedValue() {
    const selected = options.find((v) => v.value == value)
    // selected would be null, when options are dynamic and have changed.
    if (selected == null) return props.placeholder ?? 'Select Please'
    return <SelectOption option={selected} renderSelected />
  }

  return (
    <div className={props.wrapClass}>
      <input
        name={props.name}
        type="hidden"
        className="sr-only"
        value={value ?? ''}
        ref={props.inputRef}
        disabled={disabled}
        readOnly={readOnly}
      />
      <Popover
        placement="bottom-start"
        fallbackPlacements={['top-start']}
        middleware={[
          size({
            apply({ rects, elements }) {
              Object.assign(elements.floating.style, {
                maxHeight: props.maxHeight ?? '300px',
                minWidth: `${rects.reference.width}px`
              })
            },
            padding: 10
          })
        ]}>
        {props.label && <Label className="mb-1.5 block">{props.label}</Label>}
        <PopoverTrigger
          className={clsx(
            'outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border pr-2',
            props.triggerClass
          )}
          style={disabled ? { cursor: 'not-allowed', opacity: 0.5 } : undefined}
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          disabled={readOnly || disabled}>
          <div className="flex items-center p-2 text-sm">
            <span className="text-gray-700">
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
              {value == null || options == null ? (props.placeholder ?? 'Select Please') : renderSelectedValue()}
            </span>
          </div>
          {!readOnly && <RrCaretDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />}
        </PopoverTrigger>
        {props.inputError}
        <PopoverContent className="overflow-y-auto">
          {options.map((opt, index) => (
            <SelectOption key={index} onSelect={props.onChange} option={opt} />
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface SelectOptionProps {
  option: SelectOption
  renderSelected?: boolean
  onSelect?: (value: SelectValue) => void
}

const selectOptionClass = 'flex cursor-pointer items-center text-sm'
const selectOptionClassV2 = selectOptionClass + ' p-2 hover:bg-gray-100'

export function SelectOption({ onSelect, option, renderSelected = false }: SelectOptionProps) {
  const { setOpen } = getContext(PopoverContext)

  function _onSelect() {
    setOpen(false)
    onSelect?.(option.value)
  }

  return (
    <div onClick={_onSelect} className={renderSelected ? selectOptionClass : selectOptionClassV2}>
      {option.icon && option.icon}
      <span className={`${option.icon ? 'ml-2' : ''} line-clamp-1 text-start text-gray-950`}>{option.label}</span>
    </div>
  )
}

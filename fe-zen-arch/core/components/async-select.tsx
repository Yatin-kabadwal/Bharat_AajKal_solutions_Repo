import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { describeError } from 'core/utils'
import { Search } from 'icons/lucide-react'
import { RrCaretDown } from 'icons/rr/fi-rr-caret-down'
import { useEffect, useRef, useState } from 'react'
import { size } from 'ui/floating-ui'
import { getFormContext, Path, RegisterOptions, useController } from 'ui/form'
import { InputError } from 'ui/inputs/error'
import { Label } from 'ui/inputs/label'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/interactive/popover'
import { PopoverContext } from 'ui/interactive/popover-context'
import { AlertDanger } from 'ui/notify/alert'
import { Spinner } from 'ui/notify/spinner'
import { clsx, DisallowNever, getContext } from 'ui/utils'
import { Separator } from 'ui/utils/separator'

export interface SelectOption<T> {
  value: T
  label: string
}

interface BaseAsyncSelectProps<Q, O> {
  queryOptions: UseQueryOptions<Q>
  optionsMapper: (a: Q) => SelectOption<O>[]
  renderOptions?: RenderOption
  showSearch?: boolean
  label?: string
  placeholder?: string
  disabled?: boolean
  triggerClass?: string
  wrapClass?: string
  maxHeight?: string
  renderNoOption?: () => React.ReactNode
  isSelectedValue?: (selected: O | undefined, value: O) => boolean
}

interface AsyncSelectProps<T, Q, O> extends BaseAsyncSelectProps<Q, O> {
  name: Path<T>
  deps?: React.DependencyList
  rules?: RegisterOptions
}

// Q - Q is UseQueryOptions<T> generic type
// O - O is value type for option which can be string or number or any other type,
//     but if it's any other type, then type must be declared while consuming or using it.
// T - T is for Form path generic type
export function AsyncSelect<T, Q, O extends string | number | Record<string, any> = string | number>({
  name,
  deps = [],
  rules,
  ...props
}: AsyncSelectProps<DisallowNever<T>, Q, O>) {
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
    <AsyncSelectBase<Q, O>
      {...props}
      selected={value}
      onSelect={onChange}
      inputRef={ref}
      disabled={disabled}
      inputErrors={<InputError name={name} />}
    />
  )
}

export function AsyncSelectRaw<Q, O>(props: BaseAsyncSelectProps<Q, O>) {
  const [selected, setSelected] = useState<O | undefined>(undefined)

  return <AsyncSelectBase selected={selected} onSelect={setSelected} {...props} />
}

interface AsyncSelectBaseProps<Q, O> extends BaseAsyncSelectProps<Q, O> {
  selected: O | undefined
  onSelect: (v: O) => void
  inputRef?: React.ForwardedRef<HTMLInputElement>
  inputErrors?: React.ReactElement
}

function AsyncSelectBase<Q, O>({ queryOptions, ...props }: AsyncSelectBaseProps<Q, O>) {
  // opened only tracks if select options have ever been opened, not currently opened
  const [opened, setOpened] = useState(false)
  const [searchTerm, setSearchTerm] = props.showSearch ? useState('') : [undefined, undefined]

  const queryResult = useQuery<Q>({
    ...queryOptions,
    enabled: opened,
    queryKey: searchTerm == null ? queryOptions.queryKey : [...queryOptions.queryKey, searchTerm]
  })

  const options = queryResult.data != null ? props.optionsMapper(queryResult.data) : undefined

  function getSelectedValue() {
    if (props.isSelectedValue == null) return options!.find((v) => v.value == props.selected)
    return options!.find((v) => props.isSelectedValue!(props.selected, v.value))
  }

  return (
    <div className={props.wrapClass}>
      <Popover
        placement="bottom-start"
        onOpenCallback={(_) => setOpened(true)}
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
            'outline-focus-select group flex w-full cursor-pointer items-center justify-between rounded border pr-2 disabled:cursor-not-allowed disabled:opacity-50',
            props.triggerClass
          )}>
          <div className="flex items-center p-2 text-sm">
            <span className="text-gray-700">
              {props.selected == null ? (
                (props.placeholder ?? 'Select Please')
              ) : (
                <SelectOptionComponent<O> option={getSelectedValue()!} renderSelected />
              )}
            </span>
          </div>
          <RrCaretDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </PopoverTrigger>
        <PopoverContent className="overflow-y-auto">
          <RenderSelection
            showSearch={props.showSearch}
            renderOptions={props.renderOptions ?? defaultOptionRender}
            onChange={props.onSelect}
            renderNoOption={props.renderNoOption}
            queryResult={queryResult}
            searchTerm={searchTerm}
            options={options}
            setSearchTerm={setSearchTerm}
          />
        </PopoverContent>
        {props.inputErrors}
      </Popover>
    </div>
  )
}

interface RenderSelection<Q, O> {
  showSearch?: boolean
  renderOptions: RenderOption
  onChange: (s: O) => void
  queryResult: UseQueryResult<Q>
  options: SelectOption<O>[] | undefined
  setSearchTerm: React.Dispatch<React.SetStateAction<string>> | undefined
  searchTerm: string | undefined
  renderNoOption?: () => React.ReactNode
}

function RenderSelection<Q, O>(props: RenderSelection<Q, O>) {
  const { setOpen } = getContext(PopoverContext)
  const { isLoading, isError, error } = props.queryResult

  function onSelect(option: SelectOption<O>) {
    setOpen(false)
    props.onChange(option.value)
    props.setSearchTerm?.('')
  }

  return (
    <div>
      {props.showSearch && (
        <div className="flex items-center">
          <Search className="ml-2 size-5" />
          <input
            className="w-full bg-inherit px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => props.setSearchTerm!(e.target.value)}
            value={props.searchTerm}
          />
        </div>
      )}

      <Separator />
      {isLoading ? (
        <div className="flex h-36 w-full items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        renderError(error)
      ) : props.options == null ? (
        props.renderNoOption != null ? (
          props.renderNoOption()!
        ) : (
          <div className="p-2 py-4 text-sm">No Options Found</div>
        )
      ) : (
        props.renderOptions(props.options, onSelect)
      )}
    </div>
  )
}
function renderError(error: Error) {
  const { message, description } = describeError(error)
  return (
    <div className="flex h-36 w-full items-center justify-center p-2">
      <AlertDanger title={message} description={description} />
    </div>
  )
}

type RenderOption = <T>(options: SelectOption<T>[], onChange: (o: SelectOption<T>) => void) => React.ReactNode

function defaultOptionRender<T>(options: SelectOption<T>[], onChange: (o: SelectOption<T>) => void) {
  return options.map((opt, index) => <SelectOptionComponent key={index} onSelect={onChange} option={opt} />)
}

interface SelectOptionProps<T> {
  option: SelectOption<T>
  renderSelected?: boolean
  onSelect?: (value: SelectOption<T>) => void
}

const selectOptionClass = 'flex cursor-pointer items-center text-sm'
const selectOptionClassV2 = selectOptionClass + ' p-2 hover:bg-gray-100'

export function SelectOptionComponent<T>({ onSelect, option, renderSelected = false }: SelectOptionProps<T>) {
  return (
    <div onClick={() => onSelect?.(option)} className={renderSelected ? selectOptionClass : selectOptionClassV2}>
      <span className="ml-2 line-clamp-1 text-gray-950">{option.label}</span>
    </div>
  )
}

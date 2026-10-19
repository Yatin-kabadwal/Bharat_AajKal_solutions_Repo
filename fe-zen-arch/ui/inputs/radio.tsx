import { useId } from 'react'
import { clsx, clsxJoin } from 'ui/utils'

export function RadioGroup({ children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div role="radiogroup" {...props}>
      {children}
    </div>
  )
}

interface BaseRadioProps {
  value: number | string
  id?: string
  name?: string
  className?: string
  showCheckbox?: boolean
  children?: React.ReactNode
  ref?: React.Ref<HTMLInputElement>
}

export function Radio({ children, className, showCheckbox = true, ...props }: BaseRadioProps) {
  return (
    <label className={className} htmlFor={props.id}>
      <input type="radio" className="peer sr-only" {...props}></input>
      {showCheckbox && radioChecked}
      {showCheckbox && radioUnchecked}
      {children}
    </label>
  )
}

const radioBtnClass = clsxJoin(
  'flex items-center rounded border p-2 text-sm hover:bg-gray-100 cursor-pointer gap-2',
  'has-disabled:cursor-not-allowed has-disabled:opacity-50', // disabled style
  'has-checked:border-2 has-checked:border-primary-600 has-checked:bg-gray-10' // checked style
)

export function RadioBtn({ className, children, ...props }: BaseRadioProps) {
  const id = useId()

  return (
    <Radio id={id} className={clsx(radioBtnClass, className)} {...props} showCheckbox={false}>
      {children}
    </Radio>
  )
}

interface RadioCheckBox extends Omit<BaseRadioProps, 'children'> {
  label: string
}

const radioCheckBoxClass = clsx(radioBtnClass.replace('has-checked:bg-gray-10', ''), 'gap-2')

export function RadioCheckBox({ className, label, ...props }: RadioCheckBox) {
  const id = useId()

  return (
    <Radio id={id} className={clsx(radioCheckBoxClass, className)} {...props}>
      {label}
    </Radio>
  )
}

const radioUnchecked = <RadioCheck className="peer-checked:hidden" />
const radioChecked = <RadioCheck className="hidden peer-checked:flex" checked />

const radioCheckClass = clsxJoin(
  'flex size-4 items-center justify-center rounded-full border',
  'border-gray-300 peer-checked:border-primary-500', // checked style
  'bg-gray-100 peer-disabled:bg-gray-100 dark:bg-gray-950' // disabled style
)

function RadioCheck({ className, checked }: { className?: string; checked?: boolean }) {
  return (
    <div className={clsx(radioCheckClass, className)}>
      {checked && <div className="bg-primary-500 size-2 rounded-full" />}
    </div>
  )
}

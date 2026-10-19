import { Label } from './label'

type SwitchSize = 'md' | 'lg'
type SwitchColor = 'primary' | 'success' | 'danger' | 'warning' | 'info'

interface SwitchProps {
  id?: string
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  size?: SwitchSize
  color?: SwitchColor
  readOnly?: boolean
  disabled?: boolean
  ref?: React.Ref<HTMLInputElement>
}

export function SwitchBoxed(props: SwitchProps) {
  return (
    <div>
      <Label className="mb-1.5 block">Visibility</Label>
      <div
        className="flex items-center justify-between rounded border px-3"
        style={{ paddingTop: '0.38rem', paddingBottom: '0.38rem' }}>
        <p className="text-sm">Is Public</p>
        <Switch {...props} />
      </div>
    </div>
  )
}

export function Switch({ size = 'md', color = 'primary', readOnly, disabled, ...props }: SwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      <input type="checkbox" value="" className="peer sr-only" {...props} disabled={readOnly || disabled} />
      <div
        className={`peer relative ${getSize(size)} ${getColor(color)} rounded-full bg-gray-200 after:absolute after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white`}
        style={{ opacity: disabled ? 0.5 : undefined }}
      />
    </label>
  )
}

function getSize(size: SwitchSize) {
  switch (size) {
    case 'lg':
      return 'w-14 h-7 after:w-6 after:h-6 after:start-[4px] after:top-[2px]'
    default:
      return 'w-11 h-6 after:w-5 after:h-5 after:start-[2px] after:top-[2px]'
  }
}

function getColor(color: SwitchColor) {
  switch (color) {
    case 'success':
      return 'peer-checked:bg-green-500'
    case 'danger':
      return 'peer-checked:bg-red-500'
    case 'warning':
      return 'peer-checked:bg-yellow-500'
    case 'info':
      return 'peer-checked:bg-gray-500'
    default:
      return 'peer-checked:bg-primary-600'
  }
}

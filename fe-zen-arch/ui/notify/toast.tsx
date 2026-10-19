import { RrCrossSmall } from 'icons/rr/fi-rr-cross-small'
import { useEffect, useState } from 'react'
import { clsxJoin } from 'ui/utils'

const TOAST_TIMEOUT = 7500

const borderColor = { default: 'border-gray-600', success: 'border-green-600', error: 'border-red-600' }
const textColor = { default: 'text-gray-600 dark:text-gray-900', success: 'text-green-600', error: 'text-red-600' }

type ToastType = 'default' | 'success' | 'error'

export interface ToastConfig {
  id: string
  title: string
  type: ToastType
  description?: string
}

interface Props extends ToastConfig {
  onClose: (id: string) => void
}

export function Toast({ id, title, description, type, onClose }: Props) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => handleClose(), TOAST_TIMEOUT)
      return () => clearTimeout(timer)
    }
  }, [isHovered])

  function handleClose() {
    setIsLeaving(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={clsxJoin(
        'transition-[transform,opacity] duration-300 ease-in-out',
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        'z-50 min-w-96 rounded-lg border-2 bg-gray-50 p-3 text-gray-950 shadow-lg',
        borderColor[type]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-center justify-between">
        <div>
          <p className={'line-clamp-1 text-sm font-semibold ' + textColor[type]}>{title}</p>
          {description && <p className={'text-xs opacity-90 ' + textColor[type]}>{description}</p>}
        </div>
        <button type="button" onClick={handleClose} className="ml-4 rounded-full p-1 transition-colors">
          <RrCrossSmall className={'size-4 ' + textColor[type]} />
        </button>
      </div>
    </div>
  )
}

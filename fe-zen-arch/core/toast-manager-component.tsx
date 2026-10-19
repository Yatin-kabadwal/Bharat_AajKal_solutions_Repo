import { createPortal } from 'react-dom'
import { Toast } from 'ui/notify/toast'
import { removeToast, useToast } from './toast-manager'

export function ToastManager() {
  const toasts = useToast((s) => s.toasts)

  return (
    <>
      {createPortal(
        <div className="fixed top-0 right-0 z-50 m-4 flex flex-col items-end gap-3">
          {toasts.map((toast) => (
            <div key={toast.id} className="animate-slide-in transition-all duration-300 ease-out">
              <Toast onClose={removeToast} {...toast} />
            </div>
          ))}
        </div>,
        document.getElementById('toast')!
      )}
    </>
  )
}

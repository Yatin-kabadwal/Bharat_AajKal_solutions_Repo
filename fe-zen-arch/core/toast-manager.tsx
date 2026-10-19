import { ToastConfig } from 'ui/notify/toast'
import { create } from 'zustand'
import { shortId } from './utils'

interface ToastState {
  toasts: ToastConfig[]
}

export const useToast = create<ToastState>(() => ({
  toasts: []
}))

export function addToast(id: string | undefined, toast: Omit<ToastConfig, 'id'>) {
  if (id) {
    const exists = useToast.getState().toasts.some((t) => t.id == id)
    if (exists) return
  }
  const newToast = { ...toast, id: id ?? shortId() }
  useToast.setState((prev) => ({ toasts: [newToast, ...prev.toasts] }))
}

interface OptionalParam {
  id?: string
  description?: string
}

export const toast = {
  success: function success(title: string, { description, id }: OptionalParam = {}) {
    addToast(id, { title, description, type: 'success' })
  },
  error: function error(title: string, { description, id }: OptionalParam = {}) {
    addToast(id, { title, description, type: 'error' })
  },
  default: function _default(title: string, { description, id }: OptionalParam = {}) {
    addToast(id, { title, description, type: 'default' })
  }
}

export function removeToast(id: string) {
  useToast.setState((prev) => ({ toasts: prev.toasts.filter((toast) => toast.id !== id) }))
}

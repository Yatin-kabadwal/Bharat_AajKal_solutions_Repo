import { create } from 'core/lib'
import { describeError, ErrorMessage, InternalError } from '../utils'

type DeleteFunc = () => Promise<void>
type VerifyOtpFunc = (otp: string) => Promise<boolean>

interface DeleteOptions {
  resourceType: string
  deleteResource: DeleteFunc
  requireOtp?: boolean
}

interface DeleteConfirmStore {
  isOpen: boolean
  deleting: boolean
  deleteOptions: DeleteOptions | undefined
  error: ErrorMessage | undefined
  verifyOtp: VerifyOtpFunc | undefined
  initVerifyOtpFunc: (func: VerifyOtpFunc) => void
  confirmDelete: (options: DeleteOptions) => void
  closeDialog: () => void
  delete: (otp?: string) => Promise<void>
}

export const useDeleteConfirm = create<DeleteConfirmStore>((set, get) => ({
  isOpen: false,
  deleting: false,
  error: undefined,
  deleteOptions: undefined,
  verifyOtp: undefined,

  initVerifyOtpFunc: (verifyFunc) => {
    if (get().verifyOtp == null) {
      console.warn('verify function already initialized')
      return
    }
    set({ verifyOtp: verifyFunc })
  },

  confirmDelete: (options) => set({ isOpen: true, deleteOptions: options, error: undefined }),

  closeDialog: () => set({ isOpen: false }),

  delete: async (otp) => {
    try {
      set({ error: undefined, deleting: true })
      const { deleteOptions, verifyOtp } = get()
      if (deleteOptions == null) throw new Error('delete options not found')
      if (deleteOptions.requireOtp) {
        const correct = await verifyOtp!(otp!)
        if (!correct) throw new InternalError('Invalid OTP', 400, 'Please enter correct OTP')
      }
      await deleteOptions.deleteResource()
      set({ isOpen: false, deleting: false })
    } catch (error) {
      set({ error: describeError(error), deleting: false })
    }
  }
}))

export function confirmDelete(deleteResource: DeleteFunc, resourceType: string, requireOtp?: boolean) {
  useDeleteConfirm.getState().confirmDelete({ deleteResource, resourceType, requireOtp })
}

import { RrExclamation } from 'icons/rr/fi-rr-exclamation'
import { RrTrash } from 'icons/rr/fi-rr-trash'
import { useRef, useState } from 'react'
import { Button } from 'ui/basic/button'
import { CodeInput } from 'ui/inputs/code-input'
import { Input } from 'ui/inputs/input'
import { Dialog, DialogContent } from 'ui/interactive/dialog'
import { AlertDanger } from 'ui/notify/alert'
import { useDeleteConfirm } from './confirm-delete'

const otpLength = 6

export function ConfirmDeleteDialog() {
  const isOpen = useDeleteConfirm((s) => s.isOpen)
  const { closeDialog } = useDeleteConfirm.getState()

  return (
    <Dialog open={isOpen} setOpen={(isOpen) => !isOpen && closeDialog()}>
      {isOpen && <ConfirmDialogContent />}
    </Dialog>
  )
}

function ConfirmDialogContent() {
  const deleting = useDeleteConfirm((s) => s.deleting)
  const error = useDeleteConfirm((s) => s.error)

  const { deleteOptions, closeDialog } = useDeleteConfirm.getState()
  const { resourceType, requireOtp } = deleteOptions!
  const deletePrompt = `delete-${resourceType.replaceAll(' ', '-').toLowerCase()}`

  const [inputCompleted, setInputCompleted] = useState(false)
  const [otpCompleted, setOtpCompleted] = useState(!requireOtp)
  const otpRef = useRef<HTMLInputElement>(null)

  function onOtpEnter(otp: string) {
    const otpCompleted = otp.length == otpLength
    setOtpCompleted(otpCompleted)
  }

  return (
    <DialogContent className="m-4 max-w-md rounded-xl bg-gray-50 p-8" center>
      <div className="space-y-1.5 text-left">
        <div className="flex items-center gap-2">
          <RrExclamation className="size-4" />
          <h4 className="text-lg leading-none font-semibold tracking-tight">Delete {resourceType}</h4>
        </div>

        <div className="pt-2 text-sm text-gray-800">
          This action is irreversible. The <span className="font-semibold">{resourceType}</span> will be permanently
          deleted.
        </div>
      </div>

      <div className="space-y-4 py-2">
        <div className="rounded-md border p-3 text-sm">
          <p>
            To confirm, please type <span className="font-semibold">{deletePrompt}</span> below.
          </p>
        </div>

        <Input
          id="resource-name"
          onChange={(e) => setInputCompleted(e.target.value == deletePrompt)}
          placeholder={`Type ${resourceType} to confirm`}
          className="w-full"
        />

        {requireOtp && (
          <div className="space-y-2">
            <label htmlFor="otp-code" className="text-sm font-medium">
              One-time password
            </label>
            <CodeInput inputRef={otpRef} onComplete={onOtpEnter} />
            <p className="text-xs">Please enter the 2FA code for additional security.</p>
          </div>
        )}
      </div>

      {error != null && <AlertDanger title={error.message} description={error.description} className="mb-2" />}

      <div className="flex flex-row justify-between gap-x-2">
        <Button variant="outline" onClick={closeDialog}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(_) => useDeleteConfirm.getState().delete(otpRef.current?.value)}
          disabled={!(otpCompleted && inputCompleted)}
          loading={deleting}
          className="gap-1">
          <RrTrash className="size-4" />
          Delete {resourceType}
        </Button>
      </div>
    </DialogContent>
  )
}

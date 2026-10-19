import { Dialog, DialogContent, DialogTrigger } from 'ui/interactive/dialog'
import { Button } from '../basic/button'

export function AlertDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <p>My trigger</p>
      </DialogTrigger>
      <DialogContent
        center
        className="foreground bg-gray-10 z-50 m-4 w-full max-w-lg rounded-lg border border-gray-200 p-6 shadow-lg duration-200">
        <div className="grid gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-lg font-semibold">Are you absolutely sure?</h2>
            <p className="text-sm">
              This action cannot be undone. This will permanently delete your account and remove your data from our
              servers.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Continue</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

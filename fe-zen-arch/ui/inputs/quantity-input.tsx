import { RrMinus } from 'icons/rr/fi-rr-minus'
import { RrPlus } from 'icons/rr/fi-rr-plus'

export function QuantityInput() {
  return (
    <>
      <div className="relative flex max-w-32 items-center">
        <button
          type="button"
          className="h-11 rounded-s-lg border border-gray-300 bg-gray-100 p-3 hover:bg-gray-200 focus:ring-2 focus:ring-gray-100">
          <RrMinus className="size-3 text-gray-900" />
        </button>
        <input
          type="text"
          className="block h-11 w-full border border-x-0 border-gray-300 bg-transparent py-2.5 text-center text-sm text-gray-900"
          placeholder="9"
          required
        />
        <button
          type="button"
          className="h-11 rounded-e-lg border border-gray-300 bg-gray-100 p-3 hover:bg-gray-200 focus:ring-2 focus:ring-gray-100">
          <RrPlus className="size-3 text-gray-900" />
        </button>
      </div>
    </>
  )
}

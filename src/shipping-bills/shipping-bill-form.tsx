import { ErrorBlock, LoadingBlock } from '@/shared/page-state'
import { routes } from '@/shared/route-paths'
import { navigate, useParams } from 'core/routing'
import { Button } from 'ui/basic/button'
import { BillEditor } from './components/bill-editor'
import { FormOptionsContext } from './hooks/form-options-context'
import { useBillQuery, useFormOptionsQuery } from './hooks/queries'

// Route component for /shipping-bills/new and /shipping-bills/:id. It only loads what the editor
// needs (reference data, and the bill when editing) and handles loading / error / not found.
export default function ShippingBillPage() {
  const { id } = useParams<{ id?: string }>()
  const billId = id == null ? undefined : Number(id)
  const isEditing = billId != null

  const options = useFormOptionsQuery()
  const bill = useBillQuery(Number.isInteger(billId) ? billId : undefined)

  if (options.isPending || (isEditing && bill.isPending)) return <LoadingBlock label="Loading shipping bill..." />
  if (options.isError) return <ErrorBlock title="Could not load the form options" onRetry={() => options.refetch()} />
  if (isEditing && bill.isError)
    return <ErrorBlock title="Could not load this shipping bill" onRetry={() => bill.refetch()} />

  if (isEditing && bill.data == null) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Shipping bill not found</h1>
        <Button onClick={() => navigate(routes.dashboard)}>Back to list</Button>
      </div>
    )
  }

  return (
    <FormOptionsContext.Provider value={options.data}>
      <BillEditor key={id ?? 'new'} bill={bill.data} />
    </FormOptionsContext.Provider>
  )
}

import { downloadTextFile } from '@/shared/download-file'
import { EmptyBlock, ErrorBlock, LoadingBlock } from '@/shared/page-state'
import { routes } from '@/shared/route-paths'
import { shippingBillApi } from '@/shipping-bills/api'
import { formatAmount } from '@/shipping-bills/domain/calculations'
import type { BillSummary } from '@/shipping-bills/domain/types'
import { useBillsQuery } from '@/shipping-bills/hooks/queries'
import { useMutation } from 'core/react-query'
import { navigate } from 'core/routing'
import { toast } from 'core/toast-manager'
import { useState } from 'react'
import { Badge } from 'ui/basic/badge'
import { Button } from 'ui/basic/button'
import { Card, CardContent } from 'ui/basic/card'
import { Table } from 'ui/basic/table'
import { Input } from 'ui/inputs/input'

function matchesSearch(bill: BillSummary, search: string) {
  const haystack = [bill.id, bill.jobNumber, bill.exporterName, bill.consigneeName, ...bill.invoiceNumbers]
  return haystack.join(' ').toLowerCase().includes(search.trim().toLowerCase())
}

export default function ListDashboard() {
  const bills = useBillsQuery()
  const [search, setSearch] = useState('')

  const download = useMutation({
    mutationFn: (id: number) => shippingBillApi.getFlatFile(id),
    onSuccess: (file) => {
      downloadTextFile(file.filename, file.content)
      toast.success(`Flat file ${file.filename} downloaded`)
    }
  })

  const all = bills.data ?? []
  const visible = all.filter((bill) => matchesSearch(bill, search))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Shipping bills</h1>
          <p className="mt-1 text-sm text-gray-500">Create and continue the shipping bill step of each export job.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={bills.isFetching && !bills.isPending}
            onClick={() => bills.refetch()}>
            Refresh
          </Button>
          <Button onClick={() => navigate(routes.shippingBillNew)}>+ New shipping bill</Button>
        </div>
      </div>

      {bills.isPending ? (
        <LoadingBlock label="Loading shipping bills..." />
      ) : bills.isError ? (
        <ErrorBlock title="Could not load the shipping bills" onRetry={() => bills.refetch()} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Shipping bills" value={all.length} />
            <Stat label="Drafts" value={all.filter((bill) => bill.status === 'draft').length} />
            <Stat label="Submitted" value={all.filter((bill) => bill.status === 'submitted').length} />
          </div>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="w-full max-w-sm">
                  <Input
                    label="Search bills"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Job, invoice, exporter or consignee"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {visible.length} {visible.length === 1 ? 'bill' : 'bills'}
                </span>
              </div>
              {visible.length ? (
                <BillTable
                  bills={visible}
                  downloadingId={download.isPending ? download.variables : undefined}
                  onDownload={download.mutate}
                />
              ) : (
                <EmptyBlock
                  title={search ? 'No matching shipping bills' : 'No shipping bills yet'}
                  description={
                    search ? 'Try another job number or party name.' : 'Create a bill to start an export job.'
                  }
                  action={
                    !search && <Button onClick={() => navigate(routes.shippingBillNew)}>Create shipping bill</Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function BillTable({
  bills,
  downloadingId,
  onDownload
}: {
  bills: BillSummary[]
  downloadingId: number | undefined
  onDownload: (id: number) => void
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Job</th>
          <th>Exporter → Consignee</th>
          <th>Route</th>
          <th>Invoices</th>
          <th>Status</th>
          <th>Updated</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => (
          <tr key={bill.id}>
            <td className="font-medium">
              {bill.jobNumber ? `#${bill.jobNumber}` : `Bill #${bill.id}`}
              <span className="block text-xs font-normal text-gray-500">{bill.jobDate}</span>
            </td>
            <td>
              {bill.exporterName || '—'}
              <span className="block text-xs text-gray-500">to {bill.consigneeName || '—'}</span>
            </td>
            <td>
              {bill.loadingPort || '—'} → {bill.finalDestinationPort || '—'}
            </td>
            <td>
              {bill.invoiceNumbers.length}
              <span className="block text-xs text-gray-500">
                {bill.totals.map((total) => `${total.currency} ${formatAmount(total.amount)}`).join(' + ') || '—'}
              </span>
            </td>
            <td>
              <Badge variant={bill.status === 'submitted' ? 'success' : 'secondary'}>{bill.status}</Badge>
            </td>
            <td>{new Date(bill.updated).toLocaleDateString()}</td>
            <td className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  loading={downloadingId === bill.id}
                  onClick={() => onDownload(bill.id)}>
                  Flat file
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(routes.toShippingBillEdit(bill.id))}>
                  Open
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

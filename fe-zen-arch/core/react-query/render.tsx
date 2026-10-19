import { UseQueryResult } from '@tanstack/react-query'
import { Spinner, SpinnerScreen } from 'ui/notify/spinner'
import { ErrorPage, StatusPage } from 'ui/notify/status-page'

interface Props<T> {
  result: UseQueryResult<T>
  render: (data: T) => React.ReactElement
  loadingComponent?: () => React.ReactElement
  errorComponent?: () => React.ReactElement
  emptyComponent?: () => React.ReactElement
}

function renderQuery<T>({ result, render, ...props }: Props<T>) {
  if (result.isFetching) {
    return props.loadingComponent?.() ?? <Spinner />
  }

  if (result.isError) {
    return props.errorComponent?.() ?? <div />
  }

  const data = result.data

  // @ts-expect-error
  if (data == null || (data.constructor == Array && data.length == 0)) {
    return props.emptyComponent?.() ?? <div />
  }

  return render(data)
}

export function RenderQueryPage<T>({
  emptyComponent = () => <StatusPage message="Nothing to show" />,
  errorComponent = () => <ErrorPage />,
  loadingComponent = () => <SpinnerScreen />,
  ...props
}: Props<T>) {
  return renderQuery({ emptyComponent, errorComponent, loadingComponent, ...props })
}

import { QueryClient, QueryClientConfig } from '@tanstack/react-query'
import { shouldRetry } from 'core/retry'
import { toast } from 'core/toast-manager'
import { describeError } from 'core/utils'

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: Infinity
    },
    mutations: {
      retry: shouldRetry,
      onError: (error) => {
        const { message, description } = describeError(error)
        toast.error(message, { description })
      }
    }
  }
}

if (import.meta.env.DEV) {
  // To allow working offline while developing
  queryClientConfig.defaultOptions!.queries!.networkMode = 'always'
  queryClientConfig.defaultOptions!.mutations!.networkMode = 'always'
}

// export dev tools only during development, controlled by local storage
let ReactQueryDevtools: (args: any) => React.ReactElement | null
if (import.meta.env.DEV) {
  if (localStorage.getItem('react-query-devtools') != null) {
    const pkg = await import('@tanstack/react-query-devtools')
    ReactQueryDevtools = pkg.ReactQueryDevtools
  }
}

export const queryClient = new QueryClient(queryClientConfig)
export { QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
export { RenderQueryPage } from './render'
export { ReactQueryDevtools }

export type {
  QueryFunction,
  QueryFunctionContext,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query'

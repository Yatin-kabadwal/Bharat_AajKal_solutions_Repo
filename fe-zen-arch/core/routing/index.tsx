import { create, StoreApi, UseBoundStore } from 'zustand'
import { findRoute } from './render-route'
import { RouteObject } from './route-utils'

export { useQueryParam, useQueryParams } from './query-param'

interface RouterState {
  currentPath: string
  search: string
  hash: string
  state: any
  currentRoute: RouteObject
  params: Record<string, any>
}

interface RouterStore extends RouterState {
  allRoutes: RouteObject[]
  setLocation: (state: RouterState) => void
}

export let useRouterStore: UseBoundStore<StoreApi<RouterStore>> | undefined

export function initRouter(allRoutes: RouteObject[]) {
  if (import.meta.env.DEV) {
    // during dev, reload page when new route is added or removed
    if (useRouterStore != null && useRouterStore.getState().allRoutes.length != allRoutes.length) {
      window.location.reload()
    }
  }

  if (useRouterStore != null) {
    if (import.meta.env.PROD) console.warn('router already initialized')
    return
  }

  useRouterStore = create<RouterStore>((set) => {
    const currentPath = window.location.pathname
    const { params, route } = findRoute(allRoutes, currentPath)
    return {
      currentPath,
      search: window.location.search,
      hash: window.location.hash,
      state: undefined,
      allRoutes,
      currentRoute: route,
      params,
      setLocation: (state: RouterState) => set(state)
    }
  })

  window.addEventListener('popstate', updateRouter)
}

interface NavigateOptions {
  replace?: boolean
  state?: any
}
type NavigateTo = string | number

export function navigate(to: NavigateTo, options?: NavigateOptions) {
  // Handle numerical back/forward navigation
  if (typeof to === 'number') {
    window.history.go(to)
    triggerUpdateRouter(options?.state)
    return
  }

  if (to.startsWith('/:pid')) {
    const projectId = getProjectId()
    if (projectId == 0) throw new Error(`invalid path to navigate, project ID, not set, path: ${to}`)
    to = to.replace(':pid', projectId.toString())
  }

  // Handle regular navigation
  if (options?.replace) {
    window.history.replaceState(null, '', to)
  } else {
    window.history.pushState(null, '', to)
  }

  triggerUpdateRouter(options?.state)
}

function triggerUpdateRouter(state: any) {
  // Using setTimeout, so that we get the latest window.location after navigation
  setTimeout(() => updateRouter(state), 10)
}

function updateRouter(state: any) {
  const { setLocation, allRoutes } = useRouterStore!.getState()
  const currentPath = window.location.pathname
  const { params, route } = findRoute(allRoutes, currentPath)

  setLocation({
    currentPath: currentPath,
    search: window.location.search,
    hash: window.location.hash,
    state: state,
    currentRoute: route,
    params
  })
}

export function useLocation<T = any>() {
  const { currentPath, search, hash, state } = useRouterStore!.getState()

  return {
    pathname: currentPath,
    search,
    hash,
    state: state as T | undefined
  }
}

export function useParams<T>(): T {
  const { params } = useRouterStore!.getState()

  return params as T
}

export function getProjectId() {
  const { params } = useRouterStore!.getState()
  return (params.pid as number | undefined) ?? 0
}

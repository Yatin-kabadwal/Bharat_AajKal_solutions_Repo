import { cloneElement, lazy, Suspense } from 'react'
import { SpinnerScreen } from 'ui/notify/spinner'
import { RouteObject } from './route-utils'

export type RenderRoute = (route: RouteObject) => React.ReactNode

export function routeToReactElement(route: RouteObject): React.ReactElement {
  let Element: React.ReactElement

  if (typeof route.lazy == 'function') {
    const SuspenseElement = lazy(route.lazy)
    Element = (
      <Suspense fallback={<SpinnerScreen />}>
        <SuspenseElement />
      </Suspense>
    )
  } else if (route.element != null) {
    Element = route.element
  } else {
    throw new Error('Invalid Route: Missing either element or suspense')
  }

  // @ts-expect-error
  return route.wrapper != null ? cloneElement(route.wrapper, { children: Element }) : Element
}

export interface RouteMatch {
  route: RouteObject
  params: Record<string, any>
}

export function findRoute(routes: RouteObject[], currentPath: string): RouteMatch {
  // First, try exact match for performance
  const exactRoute = routes.find((route) => route.path == currentPath)
  if (exactRoute) return { route: exactRoute, params: {} }

  // Then, try path parameter matching with precompiled matchers
  for (const route of routes) {
    if (route.matcher) {
      const result = route.matcher(currentPath)
      if (result) {
        let params = result.params as Record<string, any>
        // Special parsing for project Id, to convert it from string to number
        if (params.pid != null) {
          const pid = parseInt(params.pid, 10)
          if (isNaN(pid)) {
            return { route: getNotFoundRoute(routes), params: {} }
          }
          params = { ...params, pid }
        }
        return { route, params: params }
      }
    }
  }

  // Fallback to catch-all route
  return { route: getNotFoundRoute(routes), params: {} }
}

function getNotFoundRoute(routes: RouteObject[]): RouteObject {
  const notFoundRoute = routes.find((route) => route.path === '*')
  if (notFoundRoute == null) {
    throw new Error('Routing Error: route not found')
  }
  return notFoundRoute
}

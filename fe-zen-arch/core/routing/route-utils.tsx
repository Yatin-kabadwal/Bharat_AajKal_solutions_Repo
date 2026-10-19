import { match } from 'path-to-regexp'
import { useEffect } from 'react'
import { useRouterStore } from '.'
import { RenderRoute } from './render-route'

export interface RouteObject {
  title: string
  path: string
  matcher: ReturnType<typeof match> | undefined
  isPublic?: boolean
  element?: React.ReactElement
  wrapper: React.ReactElement<HTMLDivElement> | null
  lazy?: SuspenseElement
}

export type SuspenseElement = () => Promise<{ default: React.ComponentType<any> }>

interface RouteBuilderOptions {
  isPublic?: boolean
}

export function Route(
  path: string,
  component: React.ReactElement | SuspenseElement,
  title: string,
  wrapper: React.ReactElement<HTMLDivElement> | null = null,
  { isPublic }: RouteBuilderOptions = {}
): RouteObject {
  let element: React.ReactElement | undefined = undefined
  let lazy: SuspenseElement | undefined = undefined
  if (typeof component == 'function') lazy = component
  else element = component
  const matcher = path != '*' ? match(path, { decode: decodeURIComponent }) : undefined
  return { path, lazy, element, wrapper, title, isPublic, matcher }
}

interface RouterProps {
  renderRoute: RenderRoute
}

export function Router({ renderRoute }: RouterProps) {
  // TODO: remove in future after Oct 2025, if no issue observed in navigation
  // const currentPath = useRouterStore((s) => s.currentPath)
  const currentRoute = useRouterStore!((s) => s.currentRoute)

  useEffect(() => {
    document.title = currentRoute.title
  }, [currentRoute.path])

  return renderRoute(currentRoute)
}

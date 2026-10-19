import { useMemo } from 'react'
import { useLocation } from '.'

export function useQueryParam(key: string): string | null {
  const { search } = useLocation()

  return useMemo(() => {
    return new URLSearchParams(search).get(key)
  }, [search])
}

export function useQueryParams(): Record<string, string | undefined> {
  const { search } = useLocation()

  return useMemo(() => {
    const params: Record<string, string> = {}
    new URLSearchParams(search).forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [search])
}

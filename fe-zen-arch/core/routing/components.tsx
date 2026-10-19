import { useEffect } from 'react'
import { navigate } from './'

interface LinkProps {
  to: string
  children: React.ReactNode
  replace?: boolean
  className?: string
}

export function Link({ to, children, ...props }: LinkProps) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}

interface NavigateProps {
  to: string
  replace?: boolean
}

export function Navigate({ to, replace = false }: NavigateProps) {
  useEffect(() => {
    navigate(to, { replace })
  }, [to, replace])

  return null
}

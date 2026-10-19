import { RrAngleSmallLeft } from 'icons/rr/fi-rr-angle-small-left'
import { RrAngleSmallRight } from 'icons/rr/fi-rr-angle-small-right'
import { RrMenuDots } from 'icons/rr/fi-rr-menu-dots'
import { ButtonProps } from 'ui/basic/button'
import { buttonVariants } from 'ui/basic/button-style'
import { clsx } from 'ui/utils'
import { Link } from './components'

export function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={clsx('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

export function PaginationContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={clsx('flex flex-row items-center gap-1', className)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<typeof Link>

export function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={buttonVariants({ variant: isActive ? 'outline' : 'ghost', size, className })}
      {...props}
    />
  )
}

export function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={clsx('gap-1 pl-2.5', className)}
      {...props}>
      <RrAngleSmallLeft className="size-4" />
      <span>Previous</span>
    </PaginationLink>
  )
}

export function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={clsx('gap-1 pr-2.5', className)} {...props}>
      <span>Next</span>
      <RrAngleSmallRight className="size-4" />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden className={clsx('flex size-9 items-center justify-center', className)} {...props}>
      <RrMenuDots className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

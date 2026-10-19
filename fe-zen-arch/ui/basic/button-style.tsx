import { cva } from 'class-variance-authority'

// Base button style is configured in index.css
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-gray-10 hover:bg-primary-800',
        destructive: 'text-gray-10 bg-red-700 hover:bg-red-600',
        outline: 'border hover:bg-gray-100',
        ghost: 'hover:bg-gray-200',
        link: 'text-primary-600 underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        md: 'h-11 rounded-md px-8',
        lg: 'h-12 rounded-md px-8',
        icon: 'size-10',
        null: ''
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

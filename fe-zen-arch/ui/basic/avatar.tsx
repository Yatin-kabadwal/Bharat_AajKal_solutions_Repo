import { Children, useState } from 'react'
import { cva } from 'ui/utils'

const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 object-cover',
  {
    variants: {
      size: {
        sm: 'size-8 text-sm',
        md: 'size-12 text-base',
        lg: 'size-16 text-lg',
        xl: 'size-20 text-xl',
        full: 'size-full'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
)

interface AvatarProps {
  src?: string
  className?: string
  name?: string
  initials?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({ src, className, size, name, initials, alt, ...props }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className={avatarVariants({ size, className })} {...props}>
      {src && !imageError ? (
        <img src={src} alt={alt ?? name} onError={() => setImageError(true)} loading="lazy" />
      ) : (
        <span className="font-medium text-gray-600" role="img" aria-label={name}>
          {initials ?? getInitials(name)}
        </span>
      )}
    </div>
  )
}

function getInitials(name: string | undefined) {
  if (!name) return ''
  const initialWords = name.split(' ').slice(0, 2)
  const initialLetters = initialWords.map((part) => part[0])
  return initialLetters.join('').toUpperCase()
}

interface AvatarGroupProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
  max?: number
  spacing?: number
  className?: string
}

// Avatar Group component for displaying multiple avatars
export function AvatarGroup({ children, max = 4, spacing = -3, className, ...props }: AvatarGroupProps) {
  const childrenArray = Children.toArray(children)
  const totalAvatars = childrenArray.length
  const visibleAvatars = childrenArray.slice(0, max)
  const remainingAvatars = totalAvatars - max

  return (
    <div className={`flex items-center ${className}`} role="group" {...props}>
      {visibleAvatars.map((child, index) => (
        <div key={index} style={{ marginLeft: index !== 0 ? `${spacing}rem` : 0 }}>
          {child}
        </div>
      ))}

      {remainingAvatars > 0 && (
        <div
          style={{ marginLeft: `${spacing}rem` }}
          className="inline-flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600"
          aria-label={`${remainingAvatars} more avatars`}>
          +{remainingAvatars}
        </div>
      )}
    </div>
  )
}

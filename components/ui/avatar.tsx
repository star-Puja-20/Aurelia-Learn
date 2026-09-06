import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  emoji: string
  color: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm:  'w-8 h-8 text-lg',
  md:  'w-10 h-10 text-xl',
  lg:  'w-14 h-14 text-3xl',
  xl:  'w-20 h-20 text-4xl',
}

function StudentAvatar({ emoji, color, name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'rounded-2xl flex items-center justify-center flex-shrink-0 font-display select-none',
        sizeMap[size],
        className
      )}
      style={{ backgroundColor: color + '33', border: `2px solid ${color}44` }}
      aria-label={`Avatar for ${name}`}
      title={name}
    >
      {emoji}
    </div>
  )
}

export { StudentAvatar }

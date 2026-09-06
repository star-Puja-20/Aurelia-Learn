import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { LearningLevel } from '@/lib/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border',
  {
    variants: {
      variant: {
        default:      'bg-sky-100 text-sky-600 border-sky-200',
        letter:       'bg-sky-100 text-sky-700 border-sky-200',
        word:         'bg-mint-100 text-mint-600 border-mint-200',
        sentence:     'bg-gold-100 text-gold-600 border-gold-200',
        story:        'bg-coral-100 text-coral-600 border-coral-200',
        conversation: 'bg-navy-50 text-navy-800 border-navy-100',
        success:      'bg-green-100 text-green-700 border-green-200',
        warning:      'bg-yellow-100 text-yellow-700 border-yellow-200',
        danger:       'bg-red-100 text-red-600 border-red-200',
        neutral:      'bg-gray-100 text-gray-600 border-gray-200',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

function LevelBadge({ level }: { level: LearningLevel }) {
  const icons: Record<LearningLevel, string> = {
    letter: '🔤', word: '📝', sentence: '💬', story: '📖', conversation: '🗣️',
  }
  return (
    <Badge variant={level}>
      <span>{icons[level]}</span>
      <span className="capitalize">{level}</span>
    </Badge>
  )
}

export { Badge, LevelBadge, badgeVariants }

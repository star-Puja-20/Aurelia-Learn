import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:     'bg-sky-500 text-white shadow-sm hover:bg-sky-600',
        coral:       'bg-coral-500 text-white shadow-sm hover:bg-coral-600',
        mint:        'bg-mint-500 text-white shadow-sm hover:bg-mint-600',
        gold:        'bg-gold-500 text-navy-800 shadow-sm hover:bg-gold-600',
        navy:        'bg-navy-800 text-white shadow-sm hover:bg-navy-900',
        outline:     'border-2 border-sky-300 bg-transparent text-sky-600 hover:bg-sky-50',
        ghost:       'bg-transparent text-gray-600 hover:bg-gray-100',
        destructive: 'bg-coral-500 text-white hover:bg-coral-600',
        link:        'text-sky-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-8 px-3 text-xs rounded-lg',
        default: 'h-10 px-5',
        lg:   'h-12 px-7 text-base rounded-2xl',
        xl:   'h-14 px-8 text-lg rounded-2xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

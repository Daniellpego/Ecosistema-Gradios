import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        default: 'btn-apple-primary text-white rounded-[10px] shadow-sm hover:shadow-md active:scale-[0.98]',
        secondary: 'bg-slate-100 text-text-primary hover:bg-slate-200/80 rounded-[10px] border border-slate-200/60 shadow-sm active:scale-[0.98]',
        ghost: 'text-text-secondary hover:bg-slate-100 hover:text-text-primary rounded-[10px] active:scale-[0.97]',
        destructive: 'bg-red-50 text-status-negative hover:bg-red-100 rounded-[10px] border border-red-100 active:scale-[0.98]',
        outline: 'text-text-primary bg-white hover:bg-slate-50 rounded-[10px] border border-slate-200 shadow-sm active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3.5 text-xs',
        lg: 'h-11 px-6 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

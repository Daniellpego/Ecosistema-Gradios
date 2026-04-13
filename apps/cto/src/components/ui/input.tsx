import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-[10px] bg-slate-50 border-[1.5px] border-slate-200 px-3 py-2 text-base sm:text-sm text-text-primary',
          'placeholder:text-text-muted',
          'focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

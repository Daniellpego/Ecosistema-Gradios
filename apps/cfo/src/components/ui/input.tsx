import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-[10px] bg-white px-3 py-2 text-sm text-text-primary placeholder:text-slate-400 border border-slate-200 focus:border-brand-cyan focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm',
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

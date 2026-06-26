import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'white'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary hover:bg-primary-container text-on-primary shadow-sm hover:shadow',
  secondary:
    'bg-surface-container-low hover:bg-surface-container text-on-surface',
  ghost:
    'hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface',
  danger:
    'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300',
  outline:
    'border border-outline-variant hover:border-outline text-on-surface hover:bg-surface-container-low',
  white:
    'bg-surface-container-lowest/95 hover:bg-surface-container-lowest text-on-surface shadow-sm',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9 px-4 text-sm rounded-xl gap-2',
  lg: 'h-11 px-6 text-sm rounded-xl gap-2',
  icon: 'h-9 w-9 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

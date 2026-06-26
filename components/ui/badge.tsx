import { cn } from '@/lib/utils'

type Variant =
  | 'default'
  | 'owner'
  | 'admin'
  | 'viewer'
  | 'photo'
  | 'blog'
  | 'success'
  | 'warning'
  | 'danger'

const variantStyles: Record<Variant, string> = {
  default:  'bg-surface-container-low text-on-surface-variant',
  owner:    'bg-primary-container/15 text-primary',
  admin:    'bg-violet-50 text-violet-700',
  viewer:   'bg-surface-container-low text-on-surface-variant',
  photo:    'bg-accent/15 text-on-accent',
  blog:     'bg-secondary-container text-on-secondary-container',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-accent/15 text-on-accent',
  danger:   'bg-red-50 text-red-700',
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

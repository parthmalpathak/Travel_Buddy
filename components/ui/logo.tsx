interface LogoWordmarkProps {
  className?: string
}

/**
 * "The Journey" wordmark — text-only serif treatment, matching the Stitch
 * design reference. No icon mark; the Libre Caslon Text serif carries the brand.
 */
export function LogoWordmark({ className = '' }: LogoWordmarkProps) {
  return (
    <span className={`font-serif text-primary tracking-tight ${className}`}>
      The Journey
    </span>
  )
}

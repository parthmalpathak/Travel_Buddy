import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null | undefined) {
  if (!date) return ''
  // Parse YYYY-MM-DD as local time — new Date('YYYY-MM-DD') treats it as UTC
  // which shifts the displayed date back one day in negative-offset timezones.
  const [year, month, day] = date.split('-').map(Number)
  return format(new Date(year, month - 1, day), 'MMM d, yyyy')
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getInitials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export function getShareUrl(token: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/share/${token}`
}

export function formatDistance(meters: number) {
  const miles = meters / 1609.344
  return `${Math.round(miles).toLocaleString()} mi`
}

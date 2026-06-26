import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Journey } from '@/lib/types'

const GRADIENTS = [
  'from-primary-container to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-accent to-orange-500',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-cyan-600',
]

function pickGradient(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

const ROLE_CONFIG: Record<string, { label: string; badge: string }> = {
  owner:  { label: 'Owner',  badge: 'bg-white/25 text-white backdrop-blur-sm' },
  admin:  { label: 'Admin',  badge: 'bg-white/25 text-white backdrop-blur-sm' },
  viewer: { label: 'Viewer', badge: 'bg-white/15 text-white/80 backdrop-blur-sm' },
}

interface JourneyCardProps {
  journey: Journey
  role: 'owner' | 'admin' | 'viewer'
}

export function JourneyCard({ journey, role }: JourneyCardProps) {
  const gradient = pickGradient(journey.id)
  const { label, badge } = ROLE_CONFIG[role]
  const stopCount = journey.stops?.length ?? 0

  return (
    <Link href={`/journey/${journey.id}`} className="block group">
      <article className="card overflow-hidden transition-all duration-200 group-hover:shadow-elevated group-hover:-translate-y-0.5">
        {/* Gradient header */}
        <div className={`h-28 bg-gradient-to-br ${gradient} relative`}>
          <span className={`absolute top-3 right-3 text-[11px] font-semibold px-2 py-1 rounded-full ${badge}`}>
            {label}
          </span>
          <MapPin className="absolute bottom-3 left-4 w-4.5 h-4.5 text-white/60" />
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-5 space-y-2">
          <h3 className="font-serif text-on-surface text-[17px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {journey.title}
          </h3>

          {(journey.start_location || journey.end_location) && (
            <p className="text-xs text-on-surface-variant truncate leading-relaxed">
              {[journey.start_location, journey.end_location].filter(Boolean).join(' → ')}
            </p>
          )}

          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-outline-variant/15">
            <span className="text-xs text-outline flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
            </span>
            {journey.start_date && (
              <span className="text-xs text-outline flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(journey.start_date)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

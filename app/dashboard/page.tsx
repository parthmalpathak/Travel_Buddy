import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, MapPin, Camera, FileText, Route } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { JourneyCard } from '@/components/journey/JourneyCard'
import type { Journey } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: ownedJourneys } = await supabase
    .from('journeys')
    .select('*, stops(id), posts(id, type)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: memberJourneys } = await supabase
    .from('journey_members')
    .select('role, journey:journeys(*, stops(id), posts(id, type))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const owned = (ownedJourneys ?? []).map(j => ({ ...j, role: 'owner' as const }))
  const membered = (memberJourneys ?? [])
    .filter(m => m.journey)
    .map(m => ({ ...(m.journey as any), role: m.role as 'admin' | 'viewer' }))

  // A journey should never appear twice even if a member row exists for the
  // owner's own journey (e.g. stale data from before self-invites were blocked) —
  // the owned copy always wins.
  const seen = new Set(owned.map(j => j.id))
  const allJourneys = [...owned, ...membered.filter(j => !seen.has(j.id))]

  const totalPhotos = allJourneys.reduce(
    (sum, j) => sum + (j.posts?.filter((p: any) => p.type === 'photo').length ?? 0), 0
  )
  const totalBlogs = allJourneys.reduce(
    (sum, j) => sum + (j.posts?.filter((p: any) => p.type === 'blog').length ?? 0), 0
  )

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-surface">
      <Header profile={profile} />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
        {/* Greeting */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-headline-lg text-on-surface leading-tight tracking-tight">
              Good to see you, {firstName} 👋
            </h1>
            <p className="font-sans text-body-md text-on-surface-variant mt-1.5">
              {allJourneys.length > 0
                ? `${allJourneys.length} journey${allJourneys.length !== 1 ? 's' : ''} logged`
                : 'Start your first road trip adventure'}
            </p>
          </div>
          {allJourneys.length > 0 && (
            <Link
              href="/journey/new"
              className="btn-pill-primary flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              New Journey
            </Link>
          )}
        </div>

        {/* Stats row */}
        {allJourneys.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
            {[
              { label: 'Journeys', value: allJourneys.length, Icon: Route, color: 'text-primary', bg: 'bg-primary-container/10' },
              { label: 'Photos', value: totalPhotos, Icon: Camera, color: 'text-on-accent', bg: 'bg-accent/15' },
              { label: 'Blog Posts', value: totalBlogs, Icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(({ label, value, Icon, color, bg }) => (
              <div key={label} className="card px-3 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
                <div>
                  <p className={`font-serif text-xl sm:text-2xl leading-none ${color}`}>{value}</p>
                  <p className="font-sans text-xs text-on-surface-variant mt-1 font-medium leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Journey grid */}
        {allJourneys.length === 0 ? (
          <div className="card text-center py-24 px-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/10 flex items-center justify-center mx-auto mb-5">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-serif text-headline-md text-on-surface mb-2">No journeys yet</h2>
            <p className="font-sans text-body-md text-on-surface-variant mb-7 max-w-xs mx-auto leading-relaxed">
              Plan your first road trip — add stops on the map, upload photos, and share the adventure.
            </p>
            <Link
              href="/journey/new"
              className="btn-pill-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Plan a Journey
            </Link>
          </div>
        ) : (
          <>
            <p className="font-sans text-label-md text-on-surface mb-4">Your Journeys</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allJourneys.map(j => (
                <JourneyCard key={j.id} journey={j as Journey} role={j.role} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

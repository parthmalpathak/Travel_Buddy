import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { JourneyView } from './JourneyView'
import { getShareUrl } from '@/lib/utils'

export default async function JourneyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: journey } = await supabase
    .from('journeys')
    .select('*, stops(*), owner:profiles(*)')
    .eq('id', params.id)
    .single()

  if (!journey) notFound()

  const { data: membership } = await supabase
    .from('journey_members')
    .select('role')
    .eq('journey_id', params.id)
    .eq('user_id', user.id)
    .single()

  const isOwner = journey.owner_id === user.id
  const role = isOwner ? 'owner' : membership?.role ?? null
  if (!role) notFound()

  const isAdmin = isOwner || role === 'admin'

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(*), stop:stops(*), comments(*, author:profiles(*))')
    .eq('journey_id', params.id)
    .order('created_at', { ascending: false })

  const { data: members } = isAdmin
    ? await supabase
        .from('journey_members')
        .select('*, profile:profiles(*)')
        .eq('journey_id', params.id)
        .order('created_at')
    : { data: null }

  const stops = [...(journey.stops ?? [])].sort((a, b) => a.order_index - b.order_index)
  const shareUrl = getShareUrl(journey.share_token)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header profile={profile} />
      <JourneyView
        journey={journey as any}
        stops={stops}
        posts={(posts ?? []) as any}
        members={(members ?? []) as any}
        profile={profile!}
        isOwner={isOwner}
        isAdmin={isAdmin}
        shareUrl={shareUrl}
      />
    </div>
  )
}

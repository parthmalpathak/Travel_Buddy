import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { EditJourneyForm } from './EditJourneyForm'
import { MembersPanel } from './MembersPanel'
import { ShareLinkPanel } from './ShareLinkPanel'

export default async function EditJourneyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: journey } = await supabase.from('journeys').select('*').eq('id', params.id).single()

  if (!journey) notFound()

  const isOwner = journey.owner_id === user.id

  const { data: membership } = await supabase
    .from('journey_members')
    .select('role')
    .eq('journey_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = isOwner || membership?.role === 'admin'
  if (!isAdmin) notFound()

  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from('journey_members')
      .select('*, profile:profiles(*)')
      .eq('journey_id', params.id)
      .order('created_at'),
    supabase
      .from('journey_invites')
      .select('*')
      .eq('journey_id', params.id)
      .order('created_at'),
  ])

  return (
    <div className="min-h-screen bg-surface">
      <Header profile={profile} />
      <main className="max-w-[680px] mx-auto px-margin-mobile md:px-0 py-stack-md space-y-4">
        <Link
          href={`/journey/${params.id}`}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to journey
        </Link>

        <div className="pb-2">
          <h1 className="font-serif text-headline-lg text-on-surface leading-tight tracking-tight">
            Journey Settings
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-1.5">
            {isOwner ? 'Edit details and manage who can view this journey.' : 'Manage who can view this journey.'}
          </p>
        </div>

        {isOwner && <EditJourneyForm journey={journey} />}
        {isOwner && <ShareLinkPanel journeyId={params.id} shareToken={journey.share_token} />}
        <MembersPanel
          journeyId={params.id}
          members={(members ?? []) as any}
          invites={(invites ?? []) as any}
          isOwner={isOwner}
        />
      </main>
    </div>
  )
}

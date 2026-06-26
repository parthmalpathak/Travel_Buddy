import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/share/${params.token}`)
  }

  const admin = createAdminClient()

  const { data: journey } = await admin
    .from('journeys')
    .select('id, owner_id')
    .eq('share_token', params.token)
    .single()

  if (!journey) {
    redirect('/dashboard?error=invalid_link')
  }

  if (journey.owner_id !== user.id) {
    await admin
      .from('journey_members')
      .upsert(
        { journey_id: journey.id, user_id: user.id, role: 'viewer' },
        { onConflict: 'journey_id,user_id', ignoreDuplicates: true }
      )
  }

  redirect(`/journey/${journey.id}`)
}

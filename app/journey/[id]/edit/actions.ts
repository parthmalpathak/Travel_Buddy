'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { sendInviteEmail } from '@/lib/email/send'

export async function updateJourney(
  journeyId: string,
  data: { title: string; description: string | null; startDate: string | null; endDate: string | null }
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('journeys')
    .update({
      title: data.title,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', journeyId)

  if (error) return { error: error.message }
  return {}
}

export async function regenerateShareLink(journeyId: string): Promise<{ shareToken: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: journey } = await supabase.from('journeys').select('owner_id').eq('id', journeyId).single()
  if (!journey || journey.owner_id !== user.id) return { error: 'Only the owner can regenerate the share link.' }

  const shareToken = randomUUID()
  const { error } = await supabase.from('journeys').update({ share_token: shareToken }).eq('id', journeyId)
  if (error) return { error: error.message }
  return { shareToken }
}

export async function deleteJourney(journeyId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('journeys').delete().eq('id', journeyId)
  redirect('/dashboard')
}

async function getMemberAndOwnership(
  supabase: ReturnType<typeof createClient>,
  memberId: string
): Promise<{ journeyId: string; targetRole: 'admin' | 'viewer'; ownerId: string } | null> {
  const { data: member } = await supabase
    .from('journey_members')
    .select('journey_id, role, journey:journeys(owner_id)')
    .eq('id', memberId)
    .single()

  if (!member) return null
  const ownerId = (member.journey as any)?.owner_id
  if (!ownerId) return null

  return { journeyId: member.journey_id, targetRole: member.role as 'admin' | 'viewer', ownerId }
}

export async function updateMemberRole(
  memberId: string,
  role: 'admin' | 'viewer'
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const info = await getMemberAndOwnership(supabase, memberId)
  if (!info) return { error: 'Member not found.' }

  // Demoting an existing co-admin to viewer is owner-only; promoting a viewer to
  // co-admin is allowed for any admin (RLS already permits this, matches the
  // documented "admin can promote viewers" role).
  if (info.targetRole === 'admin' && role === 'viewer' && info.ownerId !== user.id) {
    return { error: 'Only the owner can demote a co-admin.' }
  }

  const { error } = await supabase
    .from('journey_members')
    .update({ role })
    .eq('id', memberId)

  if (error) return { error: error.message }
  return {}
}

export async function removeMember(memberId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const info = await getMemberAndOwnership(supabase, memberId)
  if (!info) return { error: 'Member not found.' }

  // Co-admins can remove viewer members, but only the owner can remove a co-admin.
  if (info.targetRole === 'admin' && info.ownerId !== user.id) {
    return { error: 'Only the owner can remove a co-admin.' }
  }

  const { error } = await supabase.from('journey_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  return {}
}

export async function inviteMember(
  journeyId: string,
  email: string,
  role: 'admin' | 'viewer'
): Promise<{ error?: string; status?: 'added' | 'invited' }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Enter a valid email address.' }
  }

  if (user.email && normalizedEmail === user.email.toLowerCase()) {
    return { error: "You can't invite yourself — you already have access to this journey." }
  }

  const [{ data: existingProfile }, { data: journey }, { data: inviterProfile }] = await Promise.all([
    supabase.from('profiles').select('id').ilike('email', normalizedEmail).maybeSingle(),
    supabase.from('journeys').select('title').eq('id', journeyId).single(),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  const journeyTitle = journey?.title ?? 'a journey'
  const inviterName = inviterProfile?.full_name ?? 'Someone'

  if (existingProfile) {
    const { error } = await supabase
      .from('journey_members')
      .upsert(
        { journey_id: journeyId, user_id: existingProfile.id, role, invited_by: user.id },
        { onConflict: 'journey_id,user_id' }
      )
    if (error) return { error: error.message }
    await sendInviteEmail({
      to: normalizedEmail,
      inviterName,
      journeyTitle,
      role,
      journeyId,
      recipientHasAccount: true,
    })
    return { status: 'added' }
  }

  const { error } = await supabase
    .from('journey_invites')
    .upsert(
      { journey_id: journeyId, email: normalizedEmail, role, invited_by: user.id },
      { onConflict: 'journey_id,email' }
    )
  if (error) return { error: error.message }
  await sendInviteEmail({
    to: normalizedEmail,
    inviterName,
    journeyTitle,
    role,
    journeyId,
    recipientHasAccount: false,
  })
  return { status: 'invited' }
}

export async function cancelInvite(inviteId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('journey_invites').delete().eq('id', inviteId)
  if (error) return { error: error.message }
  return {}
}

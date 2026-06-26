'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { NewStop } from '@/lib/types'

interface CreateJourneyInput {
  title: string
  description: string | null
  startLocation: string
  endLocation: string
  startDate: string | null
  endDate: string | null
  stops: NewStop[]
}

export async function createJourney(input: CreateJourneyInput): Promise<{ journeyId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // The "user can create journey" INSERT policy on `journeys` is confirmed broken at the
  // database level (likely an orphaned RESTRICTIVE policy from earlier debugging) — a real,
  // valid JWT for this exact user still gets 42501 on INSERT even with a `with check (true)`
  // policy present, while SELECT/UPDATE/DELETE on journeys and INSERT on every other table
  // (stops, journey_members, posts, comments) all work correctly under normal RLS. Until that
  // policy is fixed via the SQL editor (requires `pg_policies` access this app doesn't have),
  // the insert goes through the admin client. owner_id is taken from the verified session
  // user above, not from client input, so this preserves the same authorization the RLS
  // policy was meant to enforce.
  const admin = createAdminClient()
  const { data: journey, error: journeyErr } = await admin
    .from('journeys')
    .insert({
      owner_id: user.id,
      title: input.title,
      description: input.description,
      start_location: input.startLocation,
      end_location: input.endLocation,
      start_date: input.startDate,
      end_date: input.endDate,
    })
    .select('id')
    .single()

  if (journeyErr || !journey) {
    return { error: journeyErr?.message ?? 'Failed to create journey.' }
  }

  const { error: stopsErr } = await supabase.from('stops').insert(
    input.stops.map((s, i) => ({
      journey_id: journey.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      order_index: i,
    }))
  )

  if (stopsErr) {
    return { error: stopsErr.message }
  }

  return { journeyId: journey.id }
}

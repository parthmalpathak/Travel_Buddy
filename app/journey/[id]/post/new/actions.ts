'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getSignedUploadUrl(
  ext: string
): Promise<{ signedUrl: string; path: string; publicUrl: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const path = `${user.id}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('post-media')
    .createSignedUploadUrl(path)

  if (error || !data) return { error: error?.message ?? 'Failed to create upload URL.' }

  const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(path)

  return { signedUrl: data.signedUrl, path, publicUrl: urlData.publicUrl }
}

export async function createPost(input: {
  journeyId: string
  stopId: string | null
  type: 'photo' | 'blog'
  title: string | null
  content: string | null
  mediaUrl: string | null
  customLocation?: { name: string; lat: number; lng: number } | null
}): Promise<{ postId: string } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      journey_id: input.journeyId,
      author_id: user.id,
      stop_id: input.stopId,
      type: input.type,
      title: input.title,
      content: input.content,
      media_url: input.mediaUrl,
      custom_location_name: input.customLocation?.name ?? null,
      custom_lat: input.customLocation?.lat ?? null,
      custom_lng: input.customLocation?.lng ?? null,
    })
    .select('id')
    .single()

  if (error || !post) return { error: error?.message ?? 'Failed to publish post.' }

  return { postId: post.id }
}

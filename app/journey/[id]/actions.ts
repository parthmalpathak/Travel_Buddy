'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deletePost(postId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return { error: error.message }
  return {}
}

export async function updatePost(
  postId: string,
  fields: { title?: string; content?: string }
): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('posts')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', postId)
  if (error) return { error: error.message }
  return {}
}

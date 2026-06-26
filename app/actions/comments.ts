'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Comment } from '@/lib/types'

export async function addComment(
  postId: string,
  content: string
): Promise<{ comment: Comment } | { error: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: content.trim() })
    .select('*, author:profiles(*)')
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to post comment.' }
  return { comment: data as Comment }
}

export async function deleteComment(commentId: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return { error: error.message }
  return {}
}

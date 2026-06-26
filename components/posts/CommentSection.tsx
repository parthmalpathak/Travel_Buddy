'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Send } from 'lucide-react'
import { addComment, deleteComment } from '@/app/actions/comments'
import { formatRelative, getInitials } from '@/lib/utils'
import type { Comment, Profile } from '@/lib/types'

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
  currentUser: Profile
}

export function CommentSection({ postId, initialComments, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)

    const result = await addComment(postId, content)
    if ('comment' in result) {
      setComments(prev => [...prev, result.comment])
      setContent('')
    }
    setSubmitting(false)
  }

  async function handleDeleteComment(commentId: string) {
    await deleteComment(commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-outline-variant/20">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar profile={comment.author} size={28} />
              <div className="flex-1 min-w-0">
                <div className="bg-surface-container-low rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold text-on-surface">
                    {comment.author?.full_name ?? 'Someone'}
                  </p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-xs text-outline">{formatRelative(comment.created_at)}</span>
                  {comment.author_id === currentUser.id && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-outline hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submitComment} className="flex gap-2.5 items-center pt-2">
        <Avatar profile={currentUser} size={28} />
        <div className="flex-1 flex items-center gap-2 border border-outline-variant/30 rounded-full px-4 py-2 bg-surface focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none bg-transparent text-on-surface placeholder:text-outline-variant"
          />
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="text-primary disabled:text-outline-variant hover:text-primary-container transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function Avatar({ profile, size }: { profile?: Profile | null; size: number }) {
  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.full_name ?? ''}
        width={size}
        height={size}
        className="rounded-full shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {getInitials(profile?.full_name)}
    </div>
  )
}

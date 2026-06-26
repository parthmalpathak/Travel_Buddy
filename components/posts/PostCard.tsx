'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, ChevronDown, ChevronUp, Trash2, Pencil, Check, X } from 'lucide-react'
import { deletePost, updatePost } from '@/app/journey/[id]/actions'
import { CommentSection } from './CommentSection'
import { formatRelative, getInitials } from '@/lib/utils'
import type { Post, Profile } from '@/lib/types'

interface PostCardProps {
  post: Post
  currentUser: Profile
  canDelete: boolean
  onDelete: (postId: string) => void
  onUpdate: (postId: string, fields: { title?: string; content?: string }) => void
  onStopClick?: (stopId: string) => void
}

export function PostCard({ post, currentUser, canDelete, onDelete, onUpdate, onStopClick }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title ?? '')
  const [editContent, setEditContent] = useState(post.content ?? '')
  const [editError, setEditError] = useState('')

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    await deletePost(post.id)
    onDelete(post.id)
  }

  function startEdit() {
    setEditTitle(post.title ?? '')
    setEditContent(post.content ?? '')
    setEditError('')
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    setEditError('')
    const fields: { title?: string; content?: string } = {
      title: editTitle.trim() || undefined,
    }
    if (post.type === 'blog') fields.content = editContent.trim()
    const result = await updatePost(post.id, fields)
    if (result.error) {
      setEditError(result.error)
      setSaving(false)
      return
    }
    onUpdate(post.id, fields)
    setEditing(false)
    setSaving(false)
  }

  const commentCount = post.comment_count ?? post.comments?.length ?? 0
  const locationLabel = post.stop?.name ?? post.custom_location_name

  if (editing) {
    return (
      <article className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full shrink-0 ${post.type === 'photo' ? 'bg-accent' : 'bg-secondary'}`} />
            <span className="font-sans text-caption text-secondary uppercase tracking-widest">
              {formatRelative(post.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-full transition-colors hover:bg-primary-container disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="p-1.5 text-outline-variant hover:text-on-surface rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          placeholder="Title (optional)"
          className="field font-serif text-headline-lg text-on-surface w-full"
        />

        {post.type === 'blog' && (
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={6}
            className="field font-sans text-body-lg text-on-surface-variant w-full resize-none"
          />
        )}

        {post.type === 'photo' && post.media_url && (
          <div className="w-full rounded-lg overflow-hidden shadow-sm relative aspect-[4/3] md:aspect-video bg-surface-container-low">
            <Image src={post.media_url} alt={post.title ?? 'Photo'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 760px" />
          </div>
        )}

        {editError && <p className="text-sm text-red-600">{editError}</p>}
      </article>
    )
  }

  return (
    <article className="flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 ${post.type === 'photo' ? 'bg-accent' : 'bg-secondary'}`} />
          <span className="font-sans text-caption text-secondary uppercase tracking-widest">
            {formatRelative(post.created_at)}
            {locationLabel && (
              <>
                {' · '}
                {post.stop ? (
                  <button
                    type="button"
                    onClick={() => onStopClick?.(post.stop!.id)}
                    disabled={!onStopClick}
                    className="hover:text-primary transition-colors disabled:hover:text-secondary underline-offset-2 hover:underline"
                  >
                    {locationLabel}
                  </button>
                ) : (
                  locationLabel
                )}
              </>
            )}
          </span>
        </div>

        {canDelete && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={startEdit}
              className="p-1.5 text-outline-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
              title="Edit post"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-outline-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {post.title && (
        <h2 className="font-serif text-headline-lg text-on-surface">{post.title}</h2>
      )}

      {post.type === 'blog' && post.content && (
        <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {post.type === 'photo' && post.media_url && (
        <div className="w-full rounded-lg overflow-hidden shadow-sm relative aspect-[4/3] md:aspect-video bg-surface-container-low">
          <Image
            src={post.media_url}
            alt={post.title ?? 'Photo'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 760px"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <AuthorAvatar profile={post.author} />
          <p className="font-sans text-caption text-on-surface-variant">{post.author?.full_name ?? 'Unknown'}</p>
        </div>

        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 font-sans text-caption text-on-surface-variant hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {commentCount > 0 ? commentCount : ''}
          {showComments ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showComments && (
        <CommentSection
          postId={post.id}
          initialComments={post.comments ?? []}
          currentUser={currentUser}
        />
      )}
    </article>
  )
}

function AuthorAvatar({ profile }: { profile?: Profile | null }) {
  if (profile?.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.full_name ?? ''}
        width={28}
        height={28}
        className="rounded-full"
      />
    )
  }
  return (
    <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-xs">
      {getInitials(profile?.full_name)}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, X } from 'lucide-react'
import { PostCard } from '@/components/posts/PostCard'
import type { Post, Profile, Stop } from '@/lib/types'

interface PostFeedProps {
  initialPosts: Post[]
  currentUser: Profile
  isAdmin: boolean
  journeyId: string
  selectedStop?: Stop | null
  onStopTagClick?: (stopId: string) => void
}

export function PostFeed({ initialPosts, currentUser, isAdmin, journeyId, selectedStop, onStopTagClick }: PostFeedProps) {
  const [posts, setPosts] = useState(initialPosts)

  function handleDelete(postId: string) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const visiblePosts = selectedStop ? posts.filter(p => p.stop_id === selectedStop.id) : posts

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 card">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-low text-on-surface-variant mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-headline-md text-on-surface mb-1">No posts yet</h3>
        <p className="font-sans text-body-md text-on-surface-variant mb-4">
          {isAdmin ? 'Start adding photos and blogs from your trip.' : 'Nothing posted yet.'}
        </p>
        {isAdmin && (
          <Link
            href={`/journey/${journeyId}/post/new`}
            className="btn-pill-primary inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add First Post
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex items-center justify-between">
        <p className="font-sans text-caption text-on-surface-variant">
          {visiblePosts.length} post{visiblePosts.length !== 1 ? 's' : ''}
          {selectedStop && <> at <span className="font-semibold text-on-surface">{selectedStop.name}</span></>}
        </p>
        {selectedStop && (
          <button
            type="button"
            onClick={() => onStopTagClick?.(selectedStop.id)}
            className="flex items-center gap-1 font-sans text-caption font-medium text-primary hover:opacity-70"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      {visiblePosts.length === 0 ? (
        <p className="text-sm text-on-surface-variant text-center py-10 card">No posts tagged at this stop yet.</p>
      ) : (
        visiblePosts.map((post, i) => (
          <div key={post.id}>
            {i > 0 && (
              <hr className="border-t border-secondary-fixed border-dashed opacity-30 mb-stack-lg w-1/2 mx-auto" />
            )}
            <PostCard
              post={post}
              currentUser={currentUser}
              canDelete={isAdmin || post.author_id === currentUser.id}
              onDelete={handleDelete}
              onStopClick={onStopTagClick}
            />
          </div>
        ))
      )}
    </div>
  )
}

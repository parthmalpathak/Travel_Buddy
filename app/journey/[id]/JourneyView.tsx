'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Settings, Share2, MapPin } from 'lucide-react'
import { JourneyMap } from '@/components/map/JourneyMap'
import { UserAvatar } from '@/components/layout/Header'
import { PostFeed } from './PostFeed'
import { CopyButton } from './CopyButton'
import { formatDate, formatDistance } from '@/lib/utils'
import type { Journey, Stop, Post, Profile, JourneyMember } from '@/lib/types'

interface JourneyViewProps {
  journey: Journey
  stops: Stop[]
  posts: Post[]
  members: JourneyMember[]
  coadmins: JourneyMember[]
  profile: Profile
  isOwner: boolean
  isAdmin: boolean
  shareUrl: string
}

export function JourneyView({ journey, stops, posts, members, coadmins, profile, isOwner, isAdmin, shareUrl }: JourneyViewProps) {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null)
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)

  function toggleStop(stopId: string) {
    setSelectedStopId(prev => (prev === stopId ? null : stopId))
  }

  const photoCount = useMemo(() => posts.filter(p => p.type === 'photo').length, [posts])

  const stopPhotos = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of posts) {
      if (p.type === 'photo' && p.media_url && p.stop_id && !map[p.stop_id]) map[p.stop_id] = p.media_url
    }
    return map
  }, [posts])

  const days = journey.start_date && journey.end_date
    ? Math.round((new Date(journey.end_date).getTime() - new Date(journey.start_date).getTime()) / 86400000) + 1
    : null

  const selectedStop = stops.find(s => s.id === selectedStopId) ?? null

  return (
    <main className="flex-grow flex flex-col pb-stack-lg">
      {/* Hero Map */}
      <section className="relative w-full h-[460px] md:h-[560px] mb-stack-md hero-clip overflow-hidden">
        <JourneyMap
          stops={stops}
          className="absolute inset-0 w-full h-full"
          highlightStopId={selectedStopId ?? undefined}
          onStopClick={stop => toggleStop(stop.id)}
          onDistanceComputed={setDistanceMeters}
          stopPhotos={stopPhotos}
          enablePlayback
        />

        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 z-10 px-margin-mobile pt-margin-mobile pb-12 md:p-margin-desktop flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex px-3 py-1 mb-4 bg-secondary-container text-on-secondary-container font-sans text-caption uppercase rounded-full tracking-wider shadow-sm">
              {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
            </div>
            <h1 className="font-serif text-[26px] leading-[1.2] md:text-display-lg text-on-primary mb-2 line-clamp-2">
              {journey.title}
            </h1>
            <p className="font-sans text-body-lg text-surface-container-low/90 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-4 h-4 shrink-0" />
              {stops[0]?.name}
              {stops.length > 1 && <> → {stops[stops.length - 1]?.name}</>}
            </p>
            {(journey.start_date || journey.end_date) && (
              <p className="font-sans text-body-md text-surface-container-low/75 mt-1.5">
                {[formatDate(journey.start_date), formatDate(journey.end_date)].filter(Boolean).join(' – ')}
              </p>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/journey/${journey.id}/post/new`}
                className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface text-primary text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shadow-lg"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Add Post
              </Link>
              <Link
                href={`/journey/${journey.id}/edit`}
                className="p-2.5 bg-on-primary/15 hover:bg-on-primary/25 text-on-primary rounded-full transition-colors backdrop-blur-sm"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop">
        {/* Share Widget — overlaps hero bottom edge */}
        {isOwner && (
          <div className="bg-surface-container-low p-stack-sm md:p-6 rounded-xl border border-secondary/10 shadow-[0_4px_24px_rgba(1,45,29,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4 -mt-stack-md relative z-10 mb-stack-md">
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <Share2 className="w-5 h-5 text-secondary opacity-70 shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-sans text-caption text-on-surface-variant uppercase tracking-wider">Share Journey</span>
                <input
                  readOnly
                  value={shareUrl}
                  className="font-sans text-body-md text-on-surface select-all cursor-text bg-surface px-2 py-1 rounded border border-outline-variant/30 mt-1 truncate w-full outline-none focus:border-primary"
                />
              </div>
            </div>
            <CopyButton text={shareUrl} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left Column: Post feed */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg min-w-0">
            <PostFeed
              initialPosts={posts}
              currentUser={profile}
              isAdmin={isAdmin}
              journeyId={journey.id}
              selectedStop={selectedStop}
              onStopTagClick={toggleStop}
            />
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8 mt-stack-md lg:mt-0">
            {/* Journey Crew — owner + co-admins, visible to all */}
            {journey.owner && (
              <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                <h4 className="font-serif text-headline-md text-on-surface mb-4">Journey Crew</h4>
                <ul className="flex flex-col gap-3">
                  <li className="flex items-center gap-2.5">
                    <UserAvatar profile={journey.owner} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium text-on-surface truncate">{journey.owner.full_name}</p>
                      <p className="font-sans text-xs text-on-surface-variant">Journey Owner</p>
                    </div>
                  </li>
                  {coadmins.map(member => (
                    <li key={member.id} className="flex items-center gap-2.5">
                      <UserAvatar profile={member.profile!} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-on-surface truncate">
                          {member.profile?.full_name ?? 'Unknown'}
                        </p>
                        <p className="font-sans text-xs text-on-surface-variant">Co-admin</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Journey Details */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
              <h4 className="font-serif text-headline-md text-on-surface mb-4">Journey Details</h4>
              <ul className="flex flex-col gap-4">
                <li className="flex justify-between items-center border-b border-secondary/10 pb-2">
                  <span className="font-sans text-caption text-on-surface-variant uppercase tracking-wider">Distance</span>
                  <span className="font-sans text-label-md text-on-surface">
                    {distanceMeters ? formatDistance(distanceMeters) : '—'}
                  </span>
                </li>
                {days && (
                  <li className="flex justify-between items-center border-b border-secondary/10 pb-2">
                    <span className="font-sans text-caption text-on-surface-variant uppercase tracking-wider">Duration</span>
                    <span className="font-sans text-label-md text-on-surface">{days} {days === 1 ? 'Day' : 'Days'}</span>
                  </li>
                )}
                <li className="flex justify-between items-center border-b border-secondary/10 pb-2">
                  <span className="font-sans text-caption text-on-surface-variant uppercase tracking-wider">Stops</span>
                  <span className="font-sans text-label-md text-on-surface">{stops.length}</span>
                </li>
                <li className="flex justify-between items-center border-b border-secondary/10 pb-2">
                  <span className="font-sans text-caption text-on-surface-variant uppercase tracking-wider">Photos</span>
                  <span className="font-sans text-label-md text-on-surface">{photoCount}</span>
                </li>
              </ul>
            </div>


            {/* Stops list — interactive */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-serif text-headline-md text-on-surface">Stops</h4>
                {selectedStopId && (
                  <button
                    type="button"
                    onClick={() => setSelectedStopId(null)}
                    className="font-sans text-caption font-medium text-primary hover:opacity-70"
                  >
                    Clear
                  </button>
                )}
              </div>
              <ol className="flex flex-col gap-1">
                {stops.map((stop, i) => (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onClick={() => toggleStop(stop.id)}
                      className={`flex items-center gap-2.5 w-full text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors ${
                        selectedStopId === stop.id ? 'bg-accent/10' : 'hover:bg-surface-container'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        i === 0 ? 'bg-emerald-500' : i === stops.length - 1 ? 'bg-red-500' : 'bg-secondary'
                      }`} />
                      <span className={`font-sans text-body-md leading-snug ${
                        selectedStopId === stop.id ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                      }`}>
                        {stop.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

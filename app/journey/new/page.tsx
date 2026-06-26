'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ArrowRight } from 'lucide-react'
import { StopMapBackground, StopControls } from '@/components/map/StopPicker'
import { Header } from '@/components/layout/Header'
import { createJourney } from './actions'
import type { NewStop } from '@/lib/types'

export default function NewJourneyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [stops, setStops] = useState<NewStop[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Journey title is required.')
    if (stops.length < 2) return setError('Add at least 2 stops to define your route.')

    setLoading(true)
    setError('')

    const result = await createJourney({
      title: title.trim(),
      description: description.trim() || null,
      startLocation: stops[0].name,
      endLocation: stops[stops.length - 1].name,
      startDate: startDate || null,
      endDate: endDate || null,
      stops,
    })

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/journey/${result.journeyId}`)
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="h-screen flex flex-col overflow-hidden bg-surface">
        <Header />

        <main className="flex-grow flex flex-col md:flex-row relative w-full min-h-0">
          {/* Full-bleed live map background */}
          <div className="absolute inset-0 z-0">
            <StopMapBackground stops={stops} />
          </div>

          {/* Floating form panel */}
          <div className="z-10 w-full md:w-[460px] bg-surface/95 backdrop-blur-xl md:border-r border-t md:border-t-0 border-outline-variant/20 shadow-[24px_0_48px_rgba(1,45,29,0.04)] flex flex-col h-[72vh] md:h-full mt-auto md:mt-0 rounded-t-3xl md:rounded-none">
            <div className="w-full flex justify-center py-3 md:hidden shrink-0">
              <div className="w-12 h-1 bg-outline-variant/40 rounded-full" />
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 md:p-10 flex-grow flex flex-col gap-6 overflow-y-auto min-h-0">
              <div>
                <h1 className="font-serif text-headline-lg md:text-display-lg text-primary mb-2">Create Journey</h1>
                <p className="font-sans text-body-md text-on-surface-variant">
                  Map your next story. Where will the road take you?
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-sans text-caption text-on-surface-variant uppercase tracking-widest">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Indiana to LA Road Trip"
                  className="field font-serif text-body-lg text-primary placeholder:text-outline-variant"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-sans text-caption text-on-surface-variant uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="A memorable cross-country adventure..."
                  className="field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-sans text-caption text-on-surface-variant uppercase tracking-widest">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="field"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-sans text-caption text-on-surface-variant uppercase tracking-widest">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="field"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                <label className="block font-sans text-caption text-on-surface-variant uppercase tracking-widest">
                  Route
                </label>
                <p className="text-xs text-on-surface-variant -mt-1 mb-2">
                  First stop = start, last stop = destination. Add at least 2.
                </p>
                <StopControls stops={stops} onChange={setStops} />
              </div>

              {error && (
                <p className="text-sm text-on-error-container bg-error-container/60 border border-error/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-pill-primary w-full flex items-center justify-center gap-2 mt-auto group"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
                    Creating journey...
                  </>
                ) : (
                  <>
                    Start Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </APIProvider>
  )
}

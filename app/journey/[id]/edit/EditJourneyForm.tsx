'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { updateJourney, deleteJourney } from './actions'
import type { Journey } from '@/lib/types'

export function EditJourneyForm({ journey }: { journey: Journey }) {
  const router = useRouter()
  const [title, setTitle] = useState(journey.title)
  const [description, setDescription] = useState(journey.description ?? '')
  const [startDate, setStartDate] = useState(journey.start_date ?? '')
  const [endDate, setEndDate] = useState(journey.end_date ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required.')
    setLoading(true)
    setError('')

    const result = await updateJourney(journey.id, {
      title: title.trim(),
      description: description.trim() || null,
      startDate: startDate || null,
      endDate: endDate || null,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this journey? This cannot be undone.')) return
    await deleteJourney(journey.id)
  }

  return (
    <div className="card p-6 space-y-5">
      <p className="font-sans text-caption font-semibold text-on-surface-variant uppercase tracking-widest">Journey Details</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block font-sans text-sm font-medium text-on-surface">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="field"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-sans text-sm font-medium text-on-surface">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="field resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-medium text-on-surface">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="field"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-medium text-on-surface">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="field"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-sans font-semibold py-3 rounded-full transition-all duration-150 text-sm ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary'
            }`}
          >
            {saved ? (
              <><Check className="w-4 h-4" />Saved!</>
            ) : loading ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}

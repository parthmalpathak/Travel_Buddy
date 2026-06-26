'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ArrowLeft, Camera, FileText, Upload, X, Send, MapPin } from 'lucide-react'
import { getSignedUploadUrl, createPost } from './actions'
import { PlacesAutocompleteInput } from '@/components/map/PlacesAutocompleteInput'
import type { Stop } from '@/lib/types'

interface PostFormProps {
  journeyId: string
  stops: Stop[]
}

const CUSTOM_LOCATION_VALUE = '__custom__'

export function PostForm({ journeyId, stops }: PostFormProps) {
  const router = useRouter()

  const [type, setType] = useState<'photo' | 'blog'>('photo')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [stopId, setStopId] = useState('')
  const [pickingCustomLocation, setPickingCustomLocation] = useState(false)
  const [customLocation, setCustomLocation] = useState<{ name: string; lat: number; lng: number } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  })

  function clearFile() {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (type === 'photo' && !file) return setError('Please select a photo.')
    if (type === 'blog' && !content.trim()) return setError('Blog content cannot be empty.')

    setLoading(true)
    setError('')

    let mediaUrl: string | null = null

    if (type === 'photo' && file) {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const urlResult = await getSignedUploadUrl(ext)
      if ('error' in urlResult) {
        setError(urlResult.error)
        setLoading(false)
        return
      }

      const uploadRes = await fetch(urlResult.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadRes.ok) {
        setError('Photo upload failed. Please try again.')
        setLoading(false)
        return
      }

      mediaUrl = urlResult.publicUrl
    }

    const result = await createPost({
      journeyId,
      stopId: customLocation ? null : (stopId || null),
      type,
      title: title.trim() || null,
      content: type === 'blog' ? content.trim() : null,
      mediaUrl,
      customLocation,
    })

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/journey/${journeyId}`)
  }

  return (
    <main className="max-w-[600px] mx-auto px-margin-mobile md:px-0 py-stack-md">
      <Link
        href={`/journey/${journeyId}`}
        className="inline-flex items-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to journey
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-headline-lg text-on-surface leading-tight tracking-tight">
          Add a Post
        </h1>
        <p className="font-sans text-body-md text-on-surface-variant mt-1.5">Share a photo or write about this leg of the trip.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="card p-5">
          <p className="font-sans text-caption font-semibold text-on-surface-variant uppercase tracking-widest mb-3">Post Type</p>
          <div className="grid grid-cols-2 gap-3">
            {(['photo', 'blog'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 ${
                  type === t
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant/40 hover:border-outline-variant text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t === 'photo'
                  ? <Camera className="w-5 h-5 shrink-0" />
                  : <FileText className="w-5 h-5 shrink-0" />
                }
                <div className="text-left">
                  <p className="font-sans text-sm font-semibold capitalize">{t}</p>
                  <p className={`font-sans text-xs mt-0.5 ${type === t ? 'text-primary' : 'text-outline'}`}>
                    {t === 'photo' ? 'Upload an image' : 'Write a story'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="card p-6 space-y-5">
          <p className="font-sans text-caption font-semibold text-on-surface-variant uppercase tracking-widest">Content</p>

          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-medium text-on-surface">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === 'photo' ? 'Grand Canyon sunset' : 'Day 3: Crossing the Rockies'}
              className="field"
            />
          </div>

          {type === 'photo' && (
            <div>
              {preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-surface-container-low group">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-150 ${
                    isDragActive
                      ? 'border-primary bg-primary-container/10'
                      : 'border-outline-variant/40 hover:border-outline-variant hover:bg-surface-container-low/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                    isDragActive ? 'bg-primary-container/20' : 'bg-surface-container-low'
                  }`}>
                    <Upload className={`w-6 h-6 ${isDragActive ? 'text-primary' : 'text-outline'}`} />
                  </div>
                  <p className="font-sans text-sm font-medium text-on-surface">
                    {isDragActive ? 'Drop it here' : 'Drag & drop a photo'}
                  </p>
                  <p className="font-sans text-xs text-outline mt-1">or click to browse · JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          )}

          {type === 'blog' && (
            <div className="space-y-1.5">
              <label className="block font-sans text-sm font-medium text-on-surface">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={9}
                placeholder="Write about your experience..."
                className="field resize-none leading-relaxed"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-sans text-sm font-medium text-on-surface">Tag a Location</label>

            {customLocation ? (
              <div className="flex items-center justify-between gap-2 border border-primary/20 bg-primary-container/10 rounded-xl px-3.5 py-3">
                <span className="flex items-center gap-1.5 font-sans text-sm text-primary truncate min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{customLocation.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setCustomLocation(null)}
                  className="text-primary/50 hover:text-red-500 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : pickingCustomLocation ? (
              <div className="flex items-center gap-2">
                <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                  <PlacesAutocompleteInput
                    autoFocus
                    placeholder="Search for where you are..."
                    onSelect={place => { setCustomLocation(place); setPickingCustomLocation(false) }}
                    className="field bg-surface-container-lowest"
                  />
                </APIProvider>
                <button
                  type="button"
                  onClick={() => setPickingCustomLocation(false)}
                  className="font-sans text-sm text-outline hover:text-on-surface shrink-0 px-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={stopId}
                onChange={e => {
                  if (e.target.value === CUSTOM_LOCATION_VALUE) {
                    setPickingCustomLocation(true)
                    setStopId('')
                  } else {
                    setStopId(e.target.value)
                  }
                }}
                className="field bg-surface-container-lowest"
              >
                <option value="">No location tag</option>
                {stops.map(stop => (
                  <option key={stop.id} value={stop.id}>{stop.name}</option>
                ))}
                <option value={CUSTOM_LOCATION_VALUE}>📍 Somewhere off the route...</option>
              </select>
            )}
            {!customLocation && !pickingCustomLocation && (
              <p className="font-sans text-xs text-outline">Not one of your planned stops? Pick a custom spot instead.</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-pill-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publish Post
            </>
          )}
        </button>
      </form>
    </main>
  )
}

'use client'

import { useState } from 'react'
import { Share2, RefreshCw, Check, Copy } from 'lucide-react'
import { regenerateShareLink } from './actions'
import { getShareUrl } from '@/lib/utils'

export function ShareLinkPanel({ journeyId, shareToken }: { journeyId: string; shareToken: string }) {
  const [token, setToken] = useState(shareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const shareUrl = getShareUrl(token)

  async function handleRegenerate() {
    if (!confirm('Generate a new share link? The old link will stop working immediately for anyone who has it but is not already a member.')) return
    setLoading(true)
    setError('')
    const result = await regenerateShareLink(journeyId)
    if ('error' in result) {
      setError(result.error)
    } else {
      setToken(result.shareToken)
    }
    setLoading(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="card p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-on-surface-variant" />
        <h2 className="font-serif text-headline-md text-on-surface">Share Link</h2>
      </div>
      <p className="font-sans text-sm text-on-surface-variant">
        Anyone with this link can sign in and view this journey. If it's ever shared somewhere it shouldn't be, regenerate it — the old link stops working instantly.
      </p>
      <div className="flex gap-2">
        <input readOnly value={shareUrl} className="flex-1 field text-xs py-2 px-3 bg-surface-container-low min-w-0" />
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/40 rounded-full transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-full transition-colors shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}

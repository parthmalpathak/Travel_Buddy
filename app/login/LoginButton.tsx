'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function LoginButton({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  async function signInWithGoogle() {
    if (!code.trim()) {
      setError('Please enter the access code.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/verify-access-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim() }),
    })

    if (!res.ok) {
      setError('Incorrect access code.')
      setLoading(false)
      return
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`,
      },
    })
  }

  return (
    <div className="space-y-3">
      <div className="text-left">
        <input
          type="password"
          value={code}
          onChange={e => { setCode(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && signInWithGoogle()}
          placeholder="Access code"
          autoComplete="off"
          className="field w-full"
        />
        {error && (
          <p className="mt-1.5 font-sans text-caption text-error">{error}</p>
        )}
      </div>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-sans text-label-md font-semibold py-4 px-6 rounded-full transition-colors duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
      >
        {!loading && <GoogleIcon />}
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
            Redirecting...
          </span>
        ) : (
          'Continue with Google'
        )}
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0 group-hover:scale-110 transition-transform">
      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  )
}

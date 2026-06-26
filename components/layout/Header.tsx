'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ChevronDown, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/lib/types'

interface HeaderProps {
  profile?: Profile | null
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function signOut() {
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isDashboard = pathname === '/dashboard'
  const isCreate = pathname === '/journey/new'

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-50 w-full">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        <div className="flex items-center gap-gutter">
          <Link
            href="/dashboard"
            className="font-serif text-headline-md md:text-headline-lg text-primary tracking-tight"
          >
            The Journey
          </Link>
          <nav className="hidden md:flex gap-8 ml-8">
            <Link
              href="/dashboard"
              className={`font-sans text-label-md transition-colors hover:opacity-80 ${
                isDashboard
                  ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              My Journeys
            </Link>
            <Link
              href="/journey/new"
              className={`font-sans text-label-md transition-colors hover:opacity-80 ${
                isCreate
                  ? 'text-primary font-semibold border-b-2 border-primary pb-1'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Create
            </Link>
          </nav>
        </div>

        {profile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-surface-container-low transition-colors"
            >
              <UserAvatar profile={profile} size={36} />
              <ChevronDown
                className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-dropdown overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-3.5 border-b border-outline-variant/10">
                  <p className="text-sm font-semibold text-on-surface truncate">{profile.full_name}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{profile.email}</p>
                </div>
                <Link
                  href="/help"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help
                </Link>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors border-t border-outline-variant/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export function UserAvatar({ profile, size }: { profile: Profile; size: number }) {
  if (profile.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.full_name ?? ''}
        width={size}
        height={size}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(profile.full_name)}
    </div>
  )
}

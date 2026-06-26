'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Shield, Eye, Trash2, UserPlus, Mail, Clock, X } from 'lucide-react'
import { updateMemberRole, removeMember as removeMemberAction, inviteMember, cancelInvite } from './actions'
import { getInitials } from '@/lib/utils'
import type { JourneyMember, JourneyInvite } from '@/lib/types'

interface MembersPanelProps {
  journeyId: string
  members: JourneyMember[]
  invites: JourneyInvite[]
  isOwner: boolean
}

export function MembersPanel({ journeyId, members: initial, invites: initialInvites, isOwner }: MembersPanelProps) {
  const router = useRouter()
  const [members, setMembers] = useState(initial)
  const [invites, setInvites] = useState(initialInvites)

  useEffect(() => { setMembers(initial) }, [initial])
  useEffect(() => { setInvites(initialInvites) }, [initialInvites])

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'viewer'>('admin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function updateRole(memberId: string, role: 'admin' | 'viewer') {
    setError('')
    const result = await updateMemberRole(memberId, role)
    if (result.error) {
      setError(result.error)
      return
    }
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m))
  }

  async function removeMember(memberId: string) {
    if (!confirm('Remove this member from the journey?')) return
    setError('')
    const result = await removeMemberAction(memberId)
    if (result.error) {
      setError(result.error)
      return
    }
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setMessage('')

    const result = await inviteMember(journeyId, email, role)
    if (result.error) {
      setError(result.error)
    } else if (result.status === 'added') {
      setMessage(`${email.trim()} already has an account — added as ${role} right away.`)
      setEmail('')
      router.refresh()
    } else {
      setMessage(`Invite sent. ${email.trim()} will become a co-${role} automatically once they sign in.`)
      setEmail('')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleCancelInvite(inviteId: string) {
    await cancelInvite(inviteId)
    setInvites(prev => prev.filter(i => i.id !== inviteId))
  }

  return (
    <section className="card p-6 space-y-5">
      <div>
        <h2 className="font-serif text-headline-md text-on-surface">Members</h2>
        <p className="font-sans text-sm text-on-surface-variant mt-0.5">
          Invite someone by email to make them a co-admin, or share your link so people can join as viewers.
        </p>
      </div>

      <form onSubmit={handleInvite} className="flex flex-col gap-2">
        <div className="relative">
          <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="field pl-9 w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'admin' | 'viewer')}
            className="field bg-surface-container-lowest flex-1"
          >
            <option value="admin">Co-admin</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-primary bg-primary-container/10 border border-primary/20 rounded-xl px-4 py-2.5">{message}</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

      {invites.length > 0 && (
        <div className="space-y-2">
          <p className="font-sans text-caption font-semibold text-on-surface-variant uppercase tracking-widest">Pending Invites</p>
          <ul className="divide-y divide-outline-variant/15">
            {invites.map(invite => (
              <li key={invite.id} className="flex items-center gap-3 py-2.5">
                <div className="w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{invite.email}</p>
                  <p className="text-xs text-outline">Will join as {invite.role} when they sign in</p>
                </div>
                <button
                  onClick={() => handleCancelInvite(invite.id)}
                  className="p-1.5 text-outline-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Cancel invite"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-sm text-outline py-4 text-center">
          No members yet. Invite someone by email or share your journey link.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant/15">
          {members.map(member => (
            <li key={member.id} className="flex items-center gap-3 py-3">
              {member.profile?.avatar_url ? (
                <Image
                  src={member.profile.avatar_url}
                  alt={member.profile.full_name ?? ''}
                  width={36}
                  height={36}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-sm shrink-0">
                  {getInitials(member.profile?.full_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">
                  {member.profile?.full_name ?? 'Unknown'}
                </p>
                <p className="text-xs text-outline truncate">{member.profile?.email}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {member.role === 'admin' && !isOwner ? (
                  // Co-admins can see another co-admin's role but can't act on it — only the owner can.
                  <span
                    title="Only the owner can change a co-admin's access"
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700"
                  >
                    <Shield className="w-3 h-3" />
                    admin
                  </span>
                ) : (
                  <button
                    onClick={() => updateRole(member.id, member.role === 'admin' ? 'viewer' : 'admin')}
                    title={member.role === 'admin' ? 'Demote to viewer' : 'Promote to admin'}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                      member.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {member.role === 'admin' ? <Shield className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {member.role}
                  </button>
                )}
                {(isOwner || member.role === 'viewer') && (
                  <button
                    onClick={() => removeMember(member.id)}
                    title="Remove from journey"
                    className="p-1.5 text-outline-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

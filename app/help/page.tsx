import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Camera, Users, Share2, Play, Mail, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'

export default async function HelpPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-surface">
      <Header profile={profile} />
      <main className="max-w-[720px] mx-auto px-margin-mobile md:px-0 py-stack-md space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-on-surface-variant hover:text-on-surface mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="font-serif text-headline-lg text-on-surface leading-tight tracking-tight">
            Help &amp; Guide
          </h1>
          <p className="font-sans text-body-md text-on-surface-variant mt-1.5">Everything you need to know to get the most out of The Journey.</p>
        </div>

        <Section icon={MapPin} title="Planning a journey">
          <p>From your dashboard, click <strong>New Journey</strong>. Give it a title, optional description and dates, then search for places to build your route — the first stop you add is the start, the last is the destination.</p>
          <p>Drag stops up or down with the arrow buttons to reorder them, or remove one with the ✕. You need at least two stops to create a journey.</p>
        </Section>

        <Section icon={Camera} title="Adding photos and blog posts">
          <p>Open a journey and click <strong>Add Post</strong>. Choose <strong>Photo</strong> to upload an image, or <strong>Blog</strong> to write about that part of the trip.</p>
          <p>You can tag a post to one of your planned stops, or pick <strong>"Somewhere off the route..."</strong> to search for and tag a custom location — handy for spontaneous stops that weren't part of the original plan.</p>
        </Section>

        <Section icon={Play} title="Reliving a journey">
          <p>On any journey page, click <strong>Relive the Journey</strong> above the map. The camera flies stop-to-stop in order, showing each location's name and first photo along the way — a quick way to relive (or share) the whole trip at a glance.</p>
          <p>Click a stop on the map or in the sidebar at any time to filter the post feed down to just that location. Click a post's location tag to jump back to it on the map.</p>
        </Section>

        <Section icon={Users} title="Roles: owner, co-admin, viewer">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Owner</strong> — created the journey. Full control, including deleting it.</li>
            <li><strong>Co-admin</strong> — can add, edit, and delete posts, and manage other members.</li>
            <li><strong>Viewer</strong> — can read posts and leave comments, but can't post.</li>
          </ul>
        </Section>

        <Section icon={Mail} title="Inviting co-admins by email">
          <p>From a journey's <strong>Settings</strong> page, enter someone's email under Members and choose a role. If they already have an account, they're added immediately. If not, the invite is held — the moment they sign in with Google for the first time, they're automatically added to the journey.</p>
        </Section>

        <Section icon={Share2} title="Sharing a journey">
          <p>Every journey has a private share link, found on the journey page and in Settings. Anyone with the link can sign in with Google and join as a viewer automatically.</p>
          <p>If a link is ever shared somewhere it shouldn't be, go to Settings and click <strong>Regenerate</strong> — the old link stops working instantly, and a new one is created.</p>
        </Section>

        <Section icon={Shield} title="Privacy">
          <p>Journeys are private by default — only the owner, invited co-admins, and people who've joined via the share link can see them. There's no public discovery; a journey can only be found by someone who already has its link.</p>
        </Section>
      </main>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: typeof MapPin; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 space-y-2.5">
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-serif text-headline-md text-on-surface">{title}</h2>
      </div>
      <div className="font-sans text-sm text-on-surface-variant leading-relaxed space-y-2 [&_strong]:text-on-surface [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  )
}

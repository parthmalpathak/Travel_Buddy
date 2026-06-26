import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginButton } from './LoginButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(searchParams.next ?? '/dashboard')

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-surface">
      {/* Atmospheric background — soft layered gradients + topographic lines, evoking misty hills at dawn */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-container/40 via-surface to-surface" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.06] via-transparent to-accent/[0.08]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.18]" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <path d="M-100,500 Q200,380 400,460 T900,400 T1300,440" stroke="#012d1d" strokeWidth="1" fill="none" />
          <path d="M-100,560 Q250,440 500,520 T1000,460 T1300,500" stroke="#4e644b" strokeWidth="1" fill="none" />
          <path d="M-100,620 Q300,500 600,580 T1100,520 T1300,560" stroke="#012d1d" strokeWidth="0.75" fill="none" />
        </svg>
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(#012d1d 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />
      </div>

      {/* Login Card */}
      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0">
        <div className="bg-surface-bright/90 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-8 md:p-12 shadow-soft text-center animate-fade-in-up">
          <h1 className="font-serif text-headline-md text-primary mb-stack-md">The Journey</h1>

          <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-primary mb-2">
            Begin Your Story
          </h2>
          <p className="font-sans text-body-md text-on-surface-variant mb-stack-md">
            Sign in to document your road trips, photos, and stories.
          </p>

          <LoginButton next={searchParams.next} />

          <div className="mt-8 pt-6 border-t border-outline-variant/10">
            <p className="font-sans text-caption text-on-surface-variant">
              Your journeys stay private — only shared with people you invite.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

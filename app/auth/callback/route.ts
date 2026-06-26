import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // Verify the access code cookie set by /api/verify-access-code before allowing sign-in
    const accessCookie = request.cookies.get('_journey_access')?.value?.trim()
    if (!accessCookie || accessCookie !== process.env.ACCESS_CODE?.trim()) {
      return NextResponse.redirect(`${origin}/login?error=access_denied`)
    }

    const response = NextResponse.redirect(`${origin}${next}`)
    // Clear the short-lived access cookie now that OAuth is complete
    response.cookies.delete('_journey_access')

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const user = data.user
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, welcome_email_sent')
          .eq('id', user.id)
          .single()

        if (profile && !profile.welcome_email_sent && profile.email) {
          await sendWelcomeEmail(profile.email, profile.full_name?.split(' ')[0] ?? 'there')
          await supabase.from('profiles').update({ welcome_email_sent: true }).eq('id', user.id)
        }
      }
      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

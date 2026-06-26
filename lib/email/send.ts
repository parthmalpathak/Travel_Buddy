import { resend, EMAIL_FROM } from './resend'
import { WelcomeEmail } from './templates/WelcomeEmail'
import { InviteEmail } from './templates/InviteEmail'

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

// Email sending is always best-effort — a failed or unconfigured send should
// never block sign-in or the invite flow itself.
export async function sendWelcomeEmail(to: string, firstName: string) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping welcome email.')
    return
  }
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Welcome to The Journey',
      react: WelcomeEmail({ firstName, dashboardUrl: `${getAppUrl()}/dashboard` }),
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendInviteEmail(params: {
  to: string
  inviterName: string
  journeyTitle: string
  role: 'admin' | 'viewer'
  journeyId: string
  recipientHasAccount: boolean
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping invite email.')
    return
  }
  const { to, inviterName, journeyTitle, role, journeyId, recipientHasAccount } = params
  const actionUrl = recipientHasAccount
    ? `${getAppUrl()}/journey/${journeyId}`
    : `${getAppUrl()}/login?next=${encodeURIComponent(`/journey/${journeyId}`)}`

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `${inviterName} invited you to "${journeyTitle}"`,
      react: InviteEmail({ inviterName, journeyTitle, role, actionUrl }),
    })
  } catch (error) {
    console.error('Failed to send invite email:', error)
  }
}

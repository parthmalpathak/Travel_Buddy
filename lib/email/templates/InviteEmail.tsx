import { EmailBody, EmailButton, EmailHeadline, EmailLayout } from '../EmailLayout'

interface InviteEmailProps {
  inviterName: string
  journeyTitle: string
  role: 'admin' | 'viewer'
  actionUrl: string
}

export function InviteEmail({ inviterName, journeyTitle, role, actionUrl }: InviteEmailProps) {
  const roleDescription =
    role === 'admin'
      ? 'a co-admin — you can add photos and posts, and help manage the journey'
      : 'a viewer — you can read every post and leave comments'

  return (
    <EmailLayout preview={`${inviterName} invited you to "${journeyTitle}" on The Journey`}>
      <EmailHeadline>You've been invited</EmailHeadline>
      <EmailBody>
        {inviterName} invited you to <strong style={{ color: '#1b1c1a' }}>{journeyTitle}</strong> on
        The Journey, as {roleDescription}.
      </EmailBody>
      <EmailButton href={actionUrl}>View the journey</EmailButton>
    </EmailLayout>
  )
}

export default InviteEmail

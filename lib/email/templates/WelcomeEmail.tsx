import { EmailBody, EmailButton, EmailHeadline, EmailLayout } from '../EmailLayout'

interface WelcomeEmailProps {
  firstName: string
  dashboardUrl: string
}

export function WelcomeEmail({ firstName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to The Journey — start logging your road trips.">
      <EmailHeadline>Welcome, {firstName}</EmailHeadline>
      <EmailBody>
        Your account is ready. The Journey is where you map your routes, log photos and
        stories at every stop, and share the whole trip with the people who matter.
      </EmailBody>
      <EmailButton href={dashboardUrl}>Go to your dashboard</EmailButton>
    </EmailLayout>
  )
}

export default WelcomeEmail

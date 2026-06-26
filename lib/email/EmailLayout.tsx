import {
  Body,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

// Mirrors the hex values in tailwind.config.ts — email clients can't read Tailwind,
// so these are duplicated here intentionally rather than imported.
export const colors = {
  primary: '#012d1d',
  primaryContainer: '#1b4332',
  onPrimary: '#ffffff',
  secondary: '#4e644b',
  accent: '#d4a373',
  surface: '#fbf9f5',
  surfaceContainerLow: '#f5f3ef',
  onSurface: '#1b1c1a',
  onSurfaceVariant: '#414844',
  outlineVariant: '#c1c8c2',
}

const serif = '"Libre Caslon Text", Georgia, "Times New Roman", serif'
const sans = '"Plus Jakarta Sans", -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'

export function EmailLayout({
  preview,
  children,
}: {
  preview: string
  children: React.ReactNode
}) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Libre Caslon Text"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/librecaslontext/v5/DdT878IGsGw1aF1JU10PUbTvNNaDMcq_.ttf',
            format: 'truetype',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_qU7NSg.ttf',
            format: 'truetype',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.surfaceContainerLow, margin: 0, padding: '32px 16px', fontFamily: sans }}>
        <Container
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            overflow: 'hidden',
            maxWidth: 480,
            margin: '0 auto',
            border: `1px solid ${colors.outlineVariant}40`,
          }}
        >
          <Section style={{ padding: '32px 32px 0' }}>
            <Text
              style={{
                fontFamily: serif,
                fontSize: 22,
                color: colors.primary,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              The Journey
            </Text>
          </Section>

          <Section style={{ padding: '8px 32px 32px' }}>{children}</Section>

          <Hr style={{ borderColor: `${colors.outlineVariant}40`, margin: 0 }} />

          <Section style={{ padding: '24px 32px' }}>
            <Text style={{ fontFamily: sans, fontSize: 12, color: colors.onSurfaceVariant, margin: 0, lineHeight: '1.5' }}>
              You're receiving this because of activity on your The Journey account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function EmailHeadline({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: serif,
        fontSize: 28,
        lineHeight: '1.2',
        color: colors.primary,
        margin: '0 0 12px',
      }}
    >
      {children}
    </Text>
  )
}

export function EmailBody({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: sans,
        fontSize: 15,
        lineHeight: '1.6',
        color: colors.onSurfaceVariant,
        margin: '0 0 24px',
      }}
    >
      {children}
    </Text>
  )
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table cellPadding={0} cellSpacing={0} role="presentation" style={{ margin: '8px 0 0' }}>
      <tbody>
        <tr>
          <td
            style={{
              backgroundColor: colors.primary,
              borderRadius: 9999,
            }}
          >
            <a
              href={href}
              style={{
                display: 'inline-block',
                fontFamily: sans,
                fontSize: 14,
                fontWeight: 600,
                color: colors.onPrimary,
                textDecoration: 'none',
                padding: '12px 28px',
              }}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

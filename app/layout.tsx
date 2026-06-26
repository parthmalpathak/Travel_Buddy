import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Libre_Caslon_Text } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const libreCaslon = Libre_Caslon_Text({
  subsets: ['latin'],
  variable: '--font-caslon',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'The Journey',
  description: 'Document your road trip adventures',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakartaSans.variable} ${libreCaslon.variable}`}>
      <body>{children}</body>
    </html>
  )
}

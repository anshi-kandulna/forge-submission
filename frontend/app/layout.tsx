import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { AmbientField } from '@/components/ambient-field'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zero-to-One Builder — Decision Intelligence',
  description:
    'Enterprise decision-intelligence platform that decomposes startup ideas into a dependency graph of assumptions, attacks them with AI analyst personas, and synthesizes a validated execution plan.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased" style={{ background: 'transparent' }}>
        {/* Canvas ambient field fixed at z-index -1, truly behind all glass elements */}
        <AmbientField background="transparent" />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

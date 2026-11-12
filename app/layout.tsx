import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { cn } from "@/lib/utils";
import { CookieConsent } from '@/components/consent/cookie-consent'

function resolveSiteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  } catch {
    return new URL('http://localhost:3000')
  }
}

// Pinch-zoom stays enabled (no maximumScale) for accessibility.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4FC3F7',
}

const description = 'An interactive English learning platform for children — helping young learners grow from letters to conversations.'

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  applicationName: 'Aurelia Learn',
  title: { default: 'Aurelia Learn', template: '%s | Aurelia Learn' },
  description,
  keywords: ['English learning', 'children', 'education', 'ESL', 'phonics', 'reading'],
  authors: [{ name: 'Aurelia Learn' }],
  openGraph: { type: 'website', siteName: 'Aurelia Learn', title: 'Aurelia Learn', description },
  twitter: { card: 'summary_large_image', title: 'Aurelia Learn', description },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans")}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: { fontFamily: 'Nunito, sans-serif', borderRadius: '12px' },
          }}
        />
        <CookieConsent />
      </body>
    </html>
  )
}

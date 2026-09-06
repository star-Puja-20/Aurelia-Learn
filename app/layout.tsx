import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4FC3F7',
}

export const metadata: Metadata = {
  title: { default: 'Aurelia Learn', template: '%s | Aurelia Learn' },
  description: 'An interactive English learning platform for children — helping young learners grow from letters to conversations.',
  keywords: ['English learning', 'children', 'education', 'ESL', 'phonics', 'reading'],
  authors: [{ name: 'Aurelia Learn' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  )
}

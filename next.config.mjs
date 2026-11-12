const isDev = process.env.NODE_ENV !== 'production'
const analyticsOn = Boolean(process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN)
const analytics = analyticsOn ? 'https://plausible.io' : ''

// Content Security Policy: only load code from this site (plus Supabase, Google Fonts and, if enabled, Plausible).
// 'unsafe-inline' is required by Next.js inline bootstrap scripts unless nonces are added to the middleware.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} ${analytics}`.trim(),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co",
  "media-src 'self' blob:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${analytics}`.trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The app does not use next/image, so the image optimizer endpoint is switched off (it has had serious CVEs).
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    return [{
      source: '/api/student_chart',
      destination: 'http://127.0.0.1:8000/api/student_chart',
    }]
  },
}

export default nextConfig

import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const PUBLIC_ROUTES = ['', '/auth/login', '/auth/register', '/legal/privacy', '/legal/terms', '/legal/cookies']

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map(path => ({ url: `${siteUrl}${path}`, lastModified: new Date('2026-11-09') }))
}

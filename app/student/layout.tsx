import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | Aurelia Learn', default: 'Learning session' },
  robots: { index: false, follow: false },
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return children
}

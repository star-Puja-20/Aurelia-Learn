import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learning session',
  description: 'A guided English learning session for children.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

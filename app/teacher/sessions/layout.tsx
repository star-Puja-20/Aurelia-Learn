import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sessions',
  description: 'Plan and review learning sessions.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

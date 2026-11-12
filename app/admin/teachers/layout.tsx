import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Teachers',
  description: 'Manage teacher accounts and administrator access.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}

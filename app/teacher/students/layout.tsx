import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My students',
  description: 'View and manage the students you teach.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
